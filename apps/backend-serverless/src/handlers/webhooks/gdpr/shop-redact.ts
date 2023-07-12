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

        console.log('in shop redact', event);

        const merchantService = new MerchantService(prisma);
        const gdprService = new GDPRService(prisma);

        try {
            webhookHeaders = parseAndValidateShopifyWebhookHeaders(event.headers);
        } catch (error) {
            logSentry(error, 'shop redact wrong webhook');
            return createErrorResponse(error);
        }

        console.log(
            'in 2',
            webhookHeaders['x-shopify-topic'],
            ShopifyWebhookTopic.shopRedact,
            webhookHeaders['x-shopify-topic'] === ShopifyWebhookTopic.shopRedact
        );

        if (webhookHeaders['x-shopify-topic'] != ShopifyWebhookTopic.shopRedact) {
            return createErrorResponse(new InvalidInputError('Shop Redact: wrong topic'));
        }

        Sentry.captureEvent({
            message: 'In shopRedact gdpr correct topic',
            level: 'info',
        });

        console.log('in 3', event.body);

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('Shop Redact: Missing body'));
        }

        Sentry.captureEvent({
            message: 'In shopRedact gdpr valid body',
            level: 'info',
        });
        console.log(`Is event.body a Buffer?: ${Buffer.isBuffer(event.body)}`);
        console.log('Type of event.body:', typeof event.body);

        console.log('3.5');

        try {
            verifyShopifyWebhook(Buffer.from(event.body), webhookHeaders['x-shopify-hmac-sha256']);
        } catch (error) {
            logSentry(error, 'shop redact invalid hmac');
            return createErrorResponse(error);
        }

        Sentry.captureEvent({
            message: 'valid hmac',
            level: 'info',
        });

        console.log('in 4', JSON.parse(event.body));
        let shopRedactRequest: ShopRedactRequest;

        try {
            shopRedactRequest = parseAndValidateShopRedactRequestBody(JSON.parse(event.body));
        } catch (error) {
            console.log('failed to parse body', error);
            logSentry(error, 'shop redact wrong request body');
            return createErrorResponse(error);
        }

        Sentry.captureEvent({
            message: 'In shopRedact gdpr parsed body',
            level: 'info',
            extra: {
                shopRedactRequest: JSON.stringify(shopRedactRequest),
            },
        });

        console.log('in 5');
        const merchant = await merchantService.getMerchant({ shop: shopRedactRequest.shop_domain });

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('Shop redact merchant'));
        }

        Sentry.captureEvent({
            message: 'In shopRedact got merchant',
            level: 'info',
            extra: {
                merchant: JSON.stringify(merchant),
            },
        });

        console.log('in 6');
        try {
            await gdprService.createGDPRRequest(merchant.id);
        } catch (error) {
            logSentry(error, 'shop redact gdpr service');
            return createErrorResponse(error);
        }

        Sentry.captureEvent({
            message: 'In shopRedact sent gdpr, we guuci',
            level: 'info',
        });

        console.log('in 7');
        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
