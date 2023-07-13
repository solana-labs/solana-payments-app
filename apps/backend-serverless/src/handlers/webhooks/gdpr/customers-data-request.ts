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

export const customersDataRequest = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let webhookHeaders: ShopifyWebhookHeaders;

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            return createErrorResponse(error);
        }

        if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
            return createErrorResponse(new InvalidInputError('incorrect topic for customer data'));
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('mising body'));
        }
        // cusomterDataBodyString;
        const customerDataBodyString = JSON.stringify(event.body);

        try {
            verifyShopifyWebhook(customerDataBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
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
