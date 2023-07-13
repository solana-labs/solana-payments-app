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

        Sentry.captureEvent({
            message: 'In shopRedact gdpr',
            level: 'info',
            extra: {
                event: JSON.stringify(event),
            },
        });

        const merchantService = new MerchantService(prisma);
        const gdprService = new GDPRService(prisma);

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            logSentry(error, 'shop redact wrong webhook');
            return createErrorResponse(error);
        }

        if (webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.shopRedact) {
            return createErrorResponse(new InvalidInputError('incorrect topic for shop redact'));
        }

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('Shop redact Missing body'));
        }

        try {
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);
        } catch (error) {
            return createErrorResponse(error);
        }

        let shopRedactRequest: ShopRedactRequest;

        try {
            shopRedactRequest = parseAndValidateShopRedactRequestBody(JSON.parse(event.body));
        } catch (error) {
            return createErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ shop: shopRedactRequest.shop_domain });

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        try {
            await gdprService.createGDPRRequest(merchant.id);
        } catch (error) {
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
