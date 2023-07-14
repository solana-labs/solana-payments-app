import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../errors/invalid-input.error.js';
import {
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const customersDataRequest = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('mising body'));
        }
        const customerDataBodyString = JSON.stringify(event.body);

        try {
            const webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);

            if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
                throw new InvalidInputError('incorrect topic for customer data');
            }
            verifyShopifyWebhook(customerDataBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
        } catch (error) {
            return createErrorResponse(error);
        }

        // Verified hook, return 200 since not storing data
        // If we need to delete PaymentRecords, neeed to save more data

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
