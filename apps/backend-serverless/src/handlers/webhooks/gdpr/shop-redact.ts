import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify-webhook-headers.model.js';
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/verify-shopify-webhook-header.utility.js';
import { ShopRedactRequest, parseAndValidateShopRedactRequestBody } from '../../../models/shop-redact-request.model.js';
import { Merchant, PrismaClient } from '@prisma/client';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const shopRedact = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let webhookHeaders: ShopifyWebhookHeaders;
        const prisma = new PrismaClient();
        const merchantService = new MerchantService(prisma);

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

        const shopRedactBodyString = JSON.stringify(event.body);

        try {
            verifyShopifyWebhook(shopRedactBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
        } catch (error) {
            return requestErrorResponse(error);
        }

        let shopReactRequest: ShopRedactRequest;

        try {
            shopReactRequest = parseAndValidateShopRedactRequestBody(event.body);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ shop: shopReactRequest.shop_domain });

        if (merchant == null) {
            return requestErrorResponse(new Error('Merchant not found'));
        }

        // At this point we would have the merchant record we need and we would
        // either save this into a queue or just perform the delete now

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
