import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { createSignedShopifyCookie } from '../../utilities/clients/merchant-ui/create-cookie-header.utility.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import {
    createShopifyOAuthGrantRedirectUrl,
    verifyAndParseShopifyInstallRequest,
} from '../../utilities/shopify/shopify-install-request.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const install = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResult> => {
        Sentry.captureEvent({
            message: 'in install',
            level: 'info',
        });

        const merchantService = new MerchantService(prisma);

        try {
            const parsedAppInstallQuery = await verifyAndParseShopifyInstallRequest(event.queryStringParameters);

            const shop = parsedAppInstallQuery.shop;
            const newNonce = await generatePubkeyString();
            try {
                const merchant = await merchantService.getMerchant({ shop: shop });
                await merchantService.updateMerchant(merchant, {
                    lastNonce: newNonce,
                });
            } catch {
                const newMerchantId = await generatePubkeyString();
                await merchantService.createMerchant(newMerchantId, shop, newNonce);
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
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
