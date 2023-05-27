import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify-webhook-headers.model.js';
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/verify-shopify-webhook-header.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const customersDataRequest = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let webhookHeaders: ShopifyWebhookHeaders;

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            return requestErrorResponse(error);
        }

        if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
            return requestErrorResponse(new Error('Invalid topic'));
        }

        if (event.body == null) {
            return requestErrorResponse(new Error('Missing body'));
        }

        const cusomterDataBodyString = JSON.stringify(event.body);

        try {
            verifyShopifyWebhook(cusomterDataBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
        } catch (error) {
            return requestErrorResponse(error);
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
        rethrowAfterCapture: true,
    }
);
