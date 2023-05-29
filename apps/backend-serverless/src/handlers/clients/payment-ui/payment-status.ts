import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';

export const paymentStatus = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let parsedPaymentStatusQuery: PaymentStatusRequest;

    const prisma = new PrismaClient();

    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    try {
        parsedPaymentStatusQuery = await parseAndValidatePaymentStatusRequest(event.queryStringParameters);
    } catch (error: unknown) {
        return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({
        id: parsedPaymentStatusQuery.paymentId,
    });

    if (paymentRecord == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
    }

    const merchant = await merchantService.getMerchant({
        id: paymentRecord.merchantId,
    });

    if (merchant == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
    }

    const paymentStatusResponse = {
        merchantDisplayName: merchant.shop,
        totalAmountFiatDisplay: paymentRecord.amount.toLocaleString(parsedPaymentStatusQuery.language, {
            style: 'currency',
            currency: paymentRecord.currency,
        }),
        totalAmountUSDCDisplay: `${paymentRecord.usdcAmount} USDC`,
        cancelUrl: paymentRecord.cancelURL,
        redirectUrl: paymentRecord.redirectUrl,
        completed: paymentRecord.redirectUrl ? true : false,
    };

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
