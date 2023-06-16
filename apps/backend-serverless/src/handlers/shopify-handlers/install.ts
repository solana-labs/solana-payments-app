import * as Sentry from '@sentry/serverless';
import { Merchant, PrismaClient } from '@prisma/client';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { AppInstallQueryParam } from '../../models/shopify/install-query-params.model.js';
import {
    verifyAndParseShopifyInstallRequest,
    createShopifyOAuthGrantRedirectUrl,
} from '../../utilities/shopify/shopify-install-request.utility.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { createSignedShopifyCookie } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';

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
            return createErrorResponse(error);
        }

        const merchantService = new MerchantService(prisma);

        const shop = parsedAppInstallQuery.shop;
        const newNonce = await generatePubkeyString();

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ shop: shop });
        } catch (error) {
            return createErrorResponse(error);
        }

        try {
            if (merchant == null) {
                const newMerchantId = await generatePubkeyString();
                merchant = await merchantService.createMerchant(newMerchantId, shop, newNonce);
            } else {
                merchant = await merchantService.updateMerchant(merchant, {
                    lastNonce: newNonce,
                });
            }
        } catch (error) {
            return createErrorResponse(error);
        }

        const signedCookie = createSignedShopifyCookie(newNonce);
        const cookieValue = `nonce=${signedCookie}; HttpOnly; Secure; SameSite=Lax`;

        const redirectUrl = createShopifyOAuthGrantRedirectUrl(shop, newNonce);

        return {
            statusCode: 302,
            headers: {
                'Set-Cookie': cookieValue,
                Location: redirectUrl,
                'Content-Type': 'text/html',
            },
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
