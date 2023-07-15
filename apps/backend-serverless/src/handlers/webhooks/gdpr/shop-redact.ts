import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../errors/invalid-input.error.js';
import { parseAndValidateShopRedactRequestBody } from '../../../models/shopify/shop-redact-request.model.js';
import {
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { GDPRService } from '../../../services/database/gdpr-service.database.service.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const shopRedact = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In shopRedact gdpr',
            level: 'info',
            extra: {
                event: JSON.stringify(event),
            },
        });

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('Shop redact Missing body'));
        }

        const merchantService = new MerchantService(prisma);
        const gdprService = new GDPRService(prisma);

        try {
            const webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
            if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.shopRedact) {
                throw new InvalidInputError('incorrect topic for shop redact');
            }
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);
            const shopRedactRequest = parseAndValidateShopRedactRequestBody(JSON.parse(event.body));

            const merchant = await merchantService.getMerchant({ shop: shopRedactRequest.shop_domain });

            await gdprService.createGDPRRequest(merchant.id);

            return {
                statusCode: 200,
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
