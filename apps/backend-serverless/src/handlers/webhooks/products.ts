import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import {
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../models/shopify/shopify-webhook-headers.model.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { fetchAllProducts } from '../../services/shopify/shop-products.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../utilities/shopify/verify-shopify-webhook-header.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const products = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In products webhook',
            level: 'info',
            extra: {
                event: JSON.stringify(event),
            },
        });
        if (event.body == null) {
            return createErrorResponse(
                new InvalidInputError('Customer data Missing body' + ' ' + JSON.stringify(event.headers))
            );
        }
        const merchantService = new MerchantService(prisma);

        try {
            const webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
            if (
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.productsCreate &&
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.productsDelete &&
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.productsUpdate
            ) {
                new InvalidInputError('Checkouts wrong topic ' + JSON.stringify(webhookHeaders));
            }
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);

            const merchant = await merchantService.getMerchant({ shop: webhookHeaders['x-shopify-shop-domain'] });

            const fetchedProducts = await fetchAllProducts(merchant);
            await merchantService.upsertProducts(merchant.id, fetchedProducts);

            return {
                statusCode: 200,
                body: JSON.stringify({}),
            };
        } catch (error) {
            return {
                statusCode: 200,
                body: JSON.stringify({}),
            };
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
