import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../errors/invalid-input.error.js';
import {
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../models/shopify/shopify-webhook-headers.model.js';
import { createErrorResponse } from '../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../utilities/shopify/verify-shopify-webhook-header.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const checkouts = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In checkout data',
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
        console.log('printing out body', JSON.parse(event.body));

        try {
            const webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
            if (
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.checkoutsCreate &&
                webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.checkoutsUpdate
            ) {
                new InvalidInputError('Checkouts wrong topic ' + JSON.stringify(webhookHeaders));
            }
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);

            Sentry.captureEvent({
                message: 'finsihed chekcout data',
                level: 'info',
            });
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
