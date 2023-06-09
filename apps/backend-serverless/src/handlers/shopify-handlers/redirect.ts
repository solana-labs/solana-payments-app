import * as Sentry from '@sentry/serverless';
import { KybState, Merchant, PrismaClient } from '@prisma/client';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    AppRedirectQueryParam,
    parseAndValidateAppRedirectQueryParams,
} from '../../models/shopify/redirect-query-params.model.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import { verifyRedirectParams } from '../../utilities/shopify/shopify-redirect-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { AccessTokenResponse } from '../../models/shopify/access-token-response.model.js';
import { createMechantAuthCookieHeader } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';
import axios from 'axios';
import { makePaymentAppConfigure } from '../../services/shopify/payment-app-configure.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';
import { makeAdminData } from '../../services/shopify/admin-data.service.js';
import { AdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model.js';
import { validatePaymentAppConfigured } from '../../services/shopify/validate-payment-app-configured.service.js';
import { sendAppConfigureRetryMessage } from '../../services/sqs/sqs-send-message.service.js';

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
            return errorResponse(ErrorType.internalServerError, ErrorMessage.missingEnv);
        }

        try {
            parsedAppRedirectQuery = await parseAndValidateAppRedirectQueryParams(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        try {
            await verifyRedirectParams(parsedAppRedirectQuery, prisma);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        const shop = parsedAppRedirectQuery.shop;
        const code = parsedAppRedirectQuery.code;

        try {
            accessTokenResponse = await fetchAccessToken(shop, code);
        } catch (error) {
            return requestErrorResponse(error);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ shop: shop });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        const updateData = {
            accessToken: accessTokenResponse.access_token,
            scopes: accessTokenResponse.scope,
        };

        try {
            merchant = await merchantService.updateMerchant(merchant, updateData);
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
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
            // TODO: Handle the error
            return {
                statusCode: 200,
                body: JSON.stringify(error),
            };
            // I don't think we would want to fail anything here, at best we can retry it
            // TODO: Figure out failure strategy
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
                // If this fails we should log a critical error but it's not the end of the world, it just means that we have an issue sending retry messages
                // We should eventually have some kind of redundant system here but for now we can just send the user back to the merchant ui
                // in a state that is logged in but not fully set up with Shopify
                // TODO: Handle this better
                // TODO: Log critical error
            }
        }

        let merchantAuthCookieHeader: string;
        try {
            merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        return {
            statusCode: 301,
            headers: {
                Location: `${redirectUrl}/merchant`,
                'Content-Type': 'text/html',
                'Set-Cookie': merchantAuthCookieHeader,
            },
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
