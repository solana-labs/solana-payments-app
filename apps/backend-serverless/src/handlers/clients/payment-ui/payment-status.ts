import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';

export const paymentStatus = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let parsedPaymentStatusQuery: PaymentStatusRequest;
    let paymentRecord: PaymentRecord | null;
    let merchant: Merchant | null;

    const prisma = new PrismaClient();

    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    console.log('a');

    try {
        parsedPaymentStatusQuery = await parseAndValidatePaymentStatusRequest(event.queryStringParameters);
    } catch (error: unknown) {
        return requestErrorResponse(error);
    }

    console.log('b');

    try {
        paymentRecord = await paymentRecordService.getPaymentRecord({
            id: parsedPaymentStatusQuery.id,
        });

        console.log('c');

        if (paymentRecord == null) {
            return requestErrorResponse(
                // TODO: Create a custom error type for this.
                new Error(`Could not find payment.`)
            );
        }

        console.log('d');

        merchant = await merchantService.getMerchant({
            id: paymentRecord.merchantId,
        });

        console.log('e');

        if (merchant == null) {
            return requestErrorResponse(
                // TODO: Create a custom error type for this.
                new Error(`Could not find merchant.`)
            );
        }
    } catch (error) {
        return requestErrorResponse(error);
    }

    console.log('f');

    const paymentStatusResponse = {
        merchantDisplayName: merchant.shop,
        totalAmountFiatDisplay: `${paymentRecord.amount.toFixed(2)} ${paymentRecord.currency}`,
        totalAmountUSDCDisplay: `${paymentRecord.usdcAmount.toFixed(2)} USDC`,
        cancelUrl: paymentRecord.cancelURL,
        redirectUrl: paymentRecord.redirectUrl,
        completed: paymentRecord.redirectUrl ? true : false,
    };

    console.log('g');

    const responseBodyData = {
        paymentStatus: paymentStatusResponse,
        error: null,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(responseBodyData),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    };
};
