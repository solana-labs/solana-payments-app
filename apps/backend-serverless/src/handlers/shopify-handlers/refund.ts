import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    ShopifyRefundInitiation,
    parseAndValidateShopifyRefundInitiation,
} from '../../models/process-refund.request.model.js';
import { requestErrorResponse } from '../../utilities/request-response.utility.js';
import { PrismaClient, RefundRecord, Merchant } from '@prisma/client';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';
import { MerchantService } from '../../services/database/merchant-service.database.service.js';
import { generatePubkeyString } from '../../utilities/generate-pubkey.js';
import { convertAmountAndCurrencyToUsdcSize } from '../../services/coin-gecko.service.js';

export const refund = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const prisma = new PrismaClient();
    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'));
    }

    const shop = event.headers['shopify-shop-domain'];

    if (shop == null) {
        return requestErrorResponse(new Error('Missing shop.'));
    }

    let merchant = await merchantService.getMerchant({ shop: shop });

    if (merchant == null) {
        throw new Error('Merchant not found.');
    }

    let refundInitiation: ShopifyRefundInitiation;
    try {
        refundInitiation = parseAndValidateShopifyRefundInitiation(JSON.parse(event.body));
    } catch (error) {
        return requestErrorResponse(error);
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
            return requestErrorResponse(error);
        }
    }

    // We return 201 status code here per shopify's documentation: https://shopify.dev/docs/apps/payments/implementation/process-a-refund#initiate-the-flow
    return {
        statusCode: 201,
        body: JSON.stringify({}),
    };
};
