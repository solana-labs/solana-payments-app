import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { requestErrorResponse } from '../../../utilities/responses/request-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';

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
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestHeaders);
        }

        if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestHeaders);
        }

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const cusomterDataBodyString = JSON.stringify(event.body);

        try {
            verifyShopifyWebhook(cusomterDataBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.invalidSecurityInput);
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
