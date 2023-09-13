import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import { parseAndValidateShopifyCheckout } from '../../models/shopify/checkout-data-webhook.model.js';
import {
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../models/shopify/shopify-webhook-headers.model.js';
import { CheckoutService } from '../../services/database/checkout-service.database.service.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../utilities/shopify/verify-shopify-webhook-header.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const checkouts = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        if (event.body == null) {
            return createErrorResponse(
                new InvalidInputError('Customer data Missing body' + ' ' + JSON.stringify(event.headers))
            );
        }

        try {
            const webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
            if (
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.checkoutsCreate &&
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.checkoutsUpdate
            ) {
                new InvalidInputError('Checkouts wrong topic ' + JSON.stringify(webhookHeaders));
            }
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);

            const checkoutData = parseAndValidateShopifyCheckout(JSON.parse(event.body));

            const checkoutToken = checkoutData.cart_token;
            const productIds = checkoutData.line_items.map(item => item.product_id.toString()).join(',');

            const checkoutService = new CheckoutService(prisma);

            await checkoutService.createOrUpdateCheckout(checkoutToken, productIds);

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
