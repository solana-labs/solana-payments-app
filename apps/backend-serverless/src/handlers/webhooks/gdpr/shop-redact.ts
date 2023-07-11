import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../../../errors/invalid-input.error.js';
import { MissingExpectedDatabaseRecordError } from '../../../errors/missing-expected-database-record.error.js';
import {
    ShopRedactRequest,
    parseAndValidateShopRedactRequestBody,
} from '../../../models/shopify/shop-redact-request.model.js';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { GDPRService } from '../../../services/database/gdpr-service.database.service.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { logSentry } from '../../../utilities/sentry-log.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const shopRedact = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let webhookHeaders: ShopifyWebhookHeaders;
        const merchantService = new MerchantService(prisma);
        const gdprService = new GDPRService(prisma);

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            logSentry(error, 'shop redact wrong webhook');
            return createErrorResponse(error);
        }

        if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
            return createErrorResponse(new InvalidInputError('Shop Redact: wrong topic'));
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('Shop Redact: Missing body'));
        }

        const shopRedactBodyString = JSON.stringify(event.body);

        try {
            verifyShopifyWebhook(shopRedactBodyString, webhookHeaders['X-Shopify-Hmac-Sha256']);
        } catch (error) {
            logSentry(error, 'shop redact wrong webhook');
            return createErrorResponse(error);
        }

        let shopReactRequest: ShopRedactRequest;

        try {
            shopReactRequest = parseAndValidateShopRedactRequestBody(event.body);
        } catch (error) {
            logSentry(error, 'shop redact wrong request body');
            return createErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ shop: shopReactRequest.shop_domain });

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('Shop redact merchant'));
        }

        try {
            await gdprService.createGDPRRequest(merchant.id);
        } catch (error) {
            logSentry(error, 'shop redact gdpr service');
            return createErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
