import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import axios from 'axios';
import { MissingEnvError } from '../../errors/missing-env.error.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { AccessTokenResponse } from '../../models/shopify/access-token-response.model.js';
import { parseAndValidateAppRedirectQueryParams } from '../../models/shopify/redirect-query-params.model.js';
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
        Sentry.captureEvent({
            message: 'in redirect',
            level: 'info',
        });
        const merchantService = new MerchantService(prisma);

        let accessTokenResponse: AccessTokenResponse;

        const redirectUrl = process.env.MERCHANT_UI_URL;
        const jwtSecretKey = process.env.JWT_SECRET_KEY;

        if (redirectUrl == null || jwtSecretKey == null) {
            return createErrorResponse(new MissingEnvError('merchant ui url or jwt secret key'));
        }

        const redirectHeaders = {
            Location: `${redirectUrl}/merchant`,
            'Content-Type': 'text/html',
        };

        try {
            const parsedAppRedirectQuery = await parseAndValidateAppRedirectQueryParams(event.queryStringParameters);
            await verifyRedirectParams(parsedAppRedirectQuery, prisma);

            const shop = parsedAppRedirectQuery.shop;
            const code = parsedAppRedirectQuery.code;

            accessTokenResponse = await fetchAccessToken(shop, code);
            let merchant = await merchantService.getMerchant({ shop: shop });
            if (merchant == null) {
                throw new MissingExpectedDatabaseRecordError('merchant');
            }

            verifyShopifySignedCookie(event.cookies, merchant.lastNonce);

            const updateData = {
                accessToken: accessTokenResponse.access_token,
                scopes: accessTokenResponse.scope,
            };

            merchant = await merchantService.updateMerchant(merchant, updateData);
            const adminData = makeAdminData(axios);
            try {
                const adminDataResponse = await adminData(shop, accessTokenResponse.access_token);
                merchant = await merchantService.updateMerchant(merchant, {
                    name: adminDataResponse.data.shop.name,
                    email: adminDataResponse.data.shop.email,
                });
            } catch (error) {
                Sentry.captureException(error);
                // TODO: Add to retry queue or add more places that this happens like we do for the app configure and persona
            }
            try {
                await contingentlyHandleAppConfigure(merchant, axios, prisma);
            } catch {
                // We should give the merchant other opportunties for app configure to run so moving on is okay here
                // We also log all the errors underneath so no need here
            }

            const merchantAuthCookieHeader = createMechantAuthCookieHeader(merchant.id);
            if (merchantAuthCookieHeader != null) {
                redirectHeaders['Set-Cookie'] = merchantAuthCookieHeader;
            }

            return {
                statusCode: 301,
                headers: redirectHeaders,
                body: JSON.stringify({}),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
