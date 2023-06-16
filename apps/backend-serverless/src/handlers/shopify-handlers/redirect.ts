import * as Sentry from '@sentry/serverless';
import { KybState, Merchant, PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    AppRedirectQueryParam,
    parseAndValidateAppRedirectQueryParams,
} from '../../models/shopify/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { verifyRedirectParams } from '../../utilities/shopify/shopify-redirect-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/shopify/access-token-response.model.js';
import { createMechantAuthCookieHeader } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';
import axios from 'axios';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { makeAdminData } from '../../services/shopify/admin-data.service.js';
import { AdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model.js';
import { validatePaymentAppConfigured } from '../../services/shopify/validate-payment-app-configured.service.js';
import { sendAppConfigureRetryMessage } from '../../services/sqs/sqs-send-message.service.js';
import { verifyShopifySignedCookie } from '../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const redirect = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        let parsedAppRedirectQuery: AppRedirectQueryParam;
        let accessTokenResponse: AccessTokenResponse;

        const redirectUrl = process.env.MERCHANT_UI_URL;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        if (redirectUrl == null || jwtSecretKey == null) {
            return createErrorResponse(new MissingEnvError('merchant ui url or jwt secret key'));
        }

        try {
            parsedAppRedirectQuery = await parseAndValidateAppRedirectQueryParams(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            await verifyRedirectParams(parsedAppRedirectQuery, prisma);
        } catch (error) {
            return createErrorResponse(error);
        }

        const shop = parsedAppRedirectQuery.shop;
        const code = parsedAppRedirectQuery.code;

        try {
            accessTokenResponse = await fetchAccessToken(shop, code);
        } catch (error) {
            return createErrorResponse(error);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ shop: shop });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        try {
            verifyShopifySignedCookie(event.cookies, merchant.lastNonce);
        } catch (error) {
            return createErrorResponse(error);
        }

        const updateData = {
            accessToken: accessTokenResponse.access_token,
            scopes: accessTokenResponse.scope,
        };

        try {
            merchant = await merchantService.updateMerchant(merchant, updateData);
        } catch (error) {
            return createErrorResponse(error);
        }

        const adminData = makeAdminData(axios);

        let adminDataResponse: AdminDataResponse;

        try {
            adminDataResponse = await adminData(shop, accessTokenResponse.access_token);
            merchant = await merchantService.updateMerchant(merchant, {
                name: adminDataResponse.data.shop.name,
                email: adminDataResponse.data.shop.email,
            });
        } catch (error) {
            Sentry.captureException(error);
            // I don't think we would want to fail anything here, at best we can retry it
            // TODO: Figure out failure strategy, we might want to add this to a retry queue
        }

        const paymentAppConfigure = makePaymentAppConfigure(axios);

        const addedWallet = merchant.paymentAddress != null;
        const acceptedTermsAndConditions = merchant.acceptedTermsAndConditions;
        const kybIsFinished = merchant.kybState === KybState.finished;

        const canBeActive = addedWallet && acceptedTermsAndConditions && kybIsFinished;

        try {
            const appConfigureResponse = await paymentAppConfigure(
                merchant.id,
                canBeActive,
                shop,
                accessTokenResponse.access_token
            );

            validatePaymentAppConfigured(appConfigureResponse);

            merchant = await merchantService.updateMerchant(merchant, { active: canBeActive });
        } catch (error) {
            try {
                await sendAppConfigureRetryMessage(merchant.id, canBeActive);
            } catch (error) {
                Sentry.captureException(error);
                // TODO: Figure out what we can do here but I think it's ok for the merchant to move on
            }
        }

        let merchantAuthCookieHeader: string | null = null;
        try {
            merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
        } catch (error) {
            // This would mean that the merchant won't be logged in, we could probably send them to the merchant UI with an error that they need to log in again
            // TODO: Add data to the merchant ui request that they need to log in again
        }

        let redirectHeaders = {
            Location: `${redirectUrl}/merchant`,
            'Content-Type': 'text/html',
        };

        if (merchantAuthCookieHeader != null) {
            redirectHeaders['Set-Cookie'] = merchantAuthCookieHeader;
        }

        return {
            statusCode: 301,
            headers: redirectHeaders,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
