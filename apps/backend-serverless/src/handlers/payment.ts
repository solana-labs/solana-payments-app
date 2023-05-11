import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    ShopifyPaymentInitiation,
    parseAndValidateShopifyPaymentInitiation,
} from '../models/process-payment-request.model.js';
import { requestErrorResponse } from '../utilities/request-response.utility.js';
import { PrismaClient, PaymentRecord, Merchant } from '@prisma/client';
import { PaymentRecordService } from '../services/database/payment-record-service.database.service.js';
import { MerchantService } from '../services/database/merchant-service.database.service.js';

export const payment = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let paymentInitiation: ShopifyPaymentInitiation;
    let paymentRecord: PaymentRecord | null;
    let merchant: Merchant | null;

    const prisma = new PrismaClient();

    const paymentRecordService = new PaymentRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    const paymentUiUrl = process.env.PAYMENT_UI_URL;

    if (paymentUiUrl == null) {
        return requestErrorResponse(new Error('Missing internal config.'));
    }

    if (event.body == null) {
        return requestErrorResponse(new Error('Missing body.'));
    }

    const shop = event.headers['shopify-shop-domain'];

    if (shop == null) {
        return requestErrorResponse(new Error('Missing shop.'));
    }

    merchant = await merchantService.getMerchant({ shop: shop });

    if (merchant == null) {
        throw new Error('Merchant not found.');
    }

    try {
        paymentInitiation = parseAndValidateShopifyPaymentInitiation(JSON.parse(event.body));
    } catch (error) {
        return requestErrorResponse(error);
    }

    paymentRecord = await paymentRecordService.getPaymentRecord({
        shopId: paymentInitiation.id,
    });

    if (paymentRecord == null) {
        try {
            paymentRecord = await paymentRecordService.createPaymentRecord(paymentInitiation, merchant);
        } catch (error) {
            return requestErrorResponse(error);
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                redirect_url: paymentUiUrl + '?paymentId=' + paymentRecord.id,
            },
            null,
            2
        ),
    };
};
