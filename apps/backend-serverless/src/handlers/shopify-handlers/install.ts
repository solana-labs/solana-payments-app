import * as Sentry from '@sentry/serverless';
import { PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppInstallQueryParam } from '../../models/shopify/install-query-params.model.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import {
    verifyAndParseShopifyInstallRequest,
    createShopifyOAuthGrantRedirectUrl,
} from '../../utilities/shopify/shopify-install-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const install = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let parsedAppInstallQuery: AppInstallQueryParam;

        try {
            parsedAppInstallQuery = await verifyAndParseShopifyInstallRequest(event.queryStringParameters);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const merchantService = new MerchantService(prisma);

        const shop = parsedAppInstallQuery.shop;
        const newNonce = await generatePubkeyString();

        try {
            const merchant = await merchantService.getMerchant({ shop: shop });

            if (merchant == null) {
                const newMerchantId = await generatePubkeyString();
                await merchantService.createMerchant(newMerchantId, shop, newNonce);
            } else {
                await merchantService.updateMerchant(merchant, {
                    lastNonce: newNonce,
                });
            }
        } catch (error) {
            // return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
            return {
                statusCode: 200,
                body: JSON.stringify(error),
            };
        }

        const redirectUrl = createShopifyOAuthGrantRedirectUrl(shop, newNonce);

        return {
            statusCode: 302,
            headers: {
                Location: redirectUrl,
                'Content-Type': 'text/html',
            },
            body: JSON.stringify({
                message: 'Redirecting..',
            }),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
