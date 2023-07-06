import { Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { AdminDataResponse } from '../../models/shopify-graphql-responses/admin-data.response.model.js';
import { AccessTokenResponse } from '../../models/shopify/access-token-response.model.js';
import {
    AppRedirectQueryParam,
    parseAndValidateAppRedirectQueryParams,
} from '../../models/shopify/redirect-query-params.model.js';
import { contingentlyHandleAppConfigure } from '../../services/business-logic/contigently-handle-app-configure.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchAccessToken } from '../../services/fetch-access-token.service.js';
import { makeAdminData } from '../../services/shopify/admin-data.service.js';
import { createMechantAuthCookieHeader } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';
import { verifyShopifySignedCookie } from '../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { verifyRedirectParams } from '../../utilities/shopify/shopify-redirect-request.utility.js';

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
            console.log(error);
            Sentry.captureException(error);
            // TODO: Add to retry queue or add more places that this happens like we do for the app configure and persona
        }

        try {
            await contingentlyHandleAppConfigure(merchant, axios, prisma);
        } catch {
            // We should give the merchant other opportunties for app configure to run so moving on is okay here
            // We also log all the errors underneath so no need here
        }

        let merchantAuthCookieHeader: string | null = null;
        try {
            merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
        } catch (error) {
            // This would mean that the merchant won't be logged in
            // Gonna return an error here becuase failing silently would be bad
            // The only reason this should fail is if we deploy without a jwt secret key
            return createErrorResponse(error);
        }

        const redirectHeaders = {
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
        rethrowAfterCapture: false,
    }
);
