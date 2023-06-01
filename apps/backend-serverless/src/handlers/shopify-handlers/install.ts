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

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const install = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let parsedAppInstallQuery: AppInstallQueryParam;

        const prisma = new PrismaClient();
        const merchantService = new MerchantService(prisma);

        try {
            parsedAppInstallQuery = await verifyAndParseShopifyInstallRequest(event.queryStringParameters);
        } catch (error) {
            return requestErrorResponse(error);
        }

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
            return requestErrorResponse(error);
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
    }
);
