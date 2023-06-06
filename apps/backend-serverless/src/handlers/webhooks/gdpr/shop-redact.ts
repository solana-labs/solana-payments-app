import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    ShopifyWebhookHeaders,
    ShopifyWebhookTopic,
    parseAndValidateShopifyWebhookHeaders,
} from '../../../models/shopify/shopify-webhook-headers.model.js';
import { requestErrorResponse } from '../../../utilities/responses/request-response.utility.js';
import { verifyShopifyWebhook } from '../../../utilities/shopify/verify-shopify-webhook-header.utility.js';
import {
    ShopRedactRequest,
    parseAndValidateShopRedactRequestBody,
} from '../../../models/shopify/shop-redact-request.model.js';
import { GDPR, PrismaClient } from '@prisma/client';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';
import { GDPRService } from '../../../services/database/gdpr-service.database.service.js';

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
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestHeaders);
        }

        if (webhookHeaders['X-Shopify-Topic'] != ShopifyWebhookTopic.customerData) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestHeaders);
        }

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
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
            return errorResponse(ErrorType.unauthorized, ErrorMessage.invalidSecurityInput);
        }

        const merchant = await merchantService.getMerchant({ shop: shopReactRequest.shop_domain });

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        let gdpr: GDPR;

        try {
            gdpr = await gdprService.createGDPRRequest(merchant.id);
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        if (gdpr == null) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({}),
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
