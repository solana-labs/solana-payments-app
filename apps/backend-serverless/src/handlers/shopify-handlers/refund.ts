import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    ShopifyRefundInitiation,
    parseAndValidateShopifyRefundInitiation,
} from '../../models/shopify/process-refund.request.model.js';
import { requestErrorResponse } from '../../utilities/responses/request-response.utility.js';
import { PrismaClient, RefundRecord, Merchant } from '@prisma/client';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generatePubkeyString } from '../../utilities/pubkeys.utility.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const refund = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const prisma = new PrismaClient();
        const refundRecordService = new RefundRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        if (event.body == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingBody);
        }

        const shop = event.headers['shopify-shop-domain'];

        if (shop == null) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.missingHeader);
        }

        let merchant = await merchantService.getMerchant({ shop: shop });

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        let refundInitiation: ShopifyRefundInitiation;
        try {
            refundInitiation = parseAndValidateShopifyRefundInitiation(JSON.parse(event.body));
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestBody);
        }

        let refundRecord = await refundRecordService.getRefundRecord({
            shopId: refundInitiation.id,
        });

        if (refundRecord == null) {
            try {
                const usdcSize = await convertAmountAndCurrencyToUsdcSize(
                    refundInitiation.amount,
                    refundInitiation.currency
                );
                const newRefundRecordId = await generatePubkeyString();
                refundRecord = await refundRecordService.createRefundRecord(
                    newRefundRecordId,
                    refundInitiation,
                    merchant,
                    usdcSize
                );
            } catch (error) {
                return errorResponse(ErrorType.internalServerError, ErrorMessage.internalServerError);
            }
        }

        // We return 201 status code here per shopify's documentation: https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow
        return {
            statusCode: 201,
            body: JSON.stringify({}),
        };
    }
);
