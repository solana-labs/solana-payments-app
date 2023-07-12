import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../errors/invalid-input.error.js';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const customersRedact = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let webhookHeaders: ShopifyWebhookHeaders;

        Sentry.captureEvent({
            message: 'In customersRedact gdpr',
            level: 'info',
            extra: {
                event: JSON.stringify(event),
            },
        });

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            return createErrorResponse(error);
        }

        if (webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.customerRedact) {
            return createErrorResponse(new InvalidInputError('Customers redact wrong topic'));
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('Customers redact Missing body'));
        }

        try {
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);
        } catch (error) {
            return createErrorResponse(error);
        }

        // At this point we would have verified the webhook. We do not store any customer
        // data so we can just return a 200. If for some reason, we need to delete PaymentRecords
        // related to a customer, we would need to start saving more data but i wouldnt think
        // this is the case.

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
