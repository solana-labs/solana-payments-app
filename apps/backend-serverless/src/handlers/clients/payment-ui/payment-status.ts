import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Merchant, PaymentRecord, PaymentRecordStatus, PrismaClient } from '@prisma/client';
import { requestErrorResponse } from '../../../utilities/request-response.utility.js';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/clients/payment-ui/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';

// TODO: Find somewhere to put this

interface PaymentErrrorResponse {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
}

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

    // TODO: Make this return as expected and show some kind of boof empty state
    if (paymentRecord == null) {
        return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
    }

    const merchant = await merchantService.getMerchant({
        id: paymentRecord.merchantId,
    });

    // TODO: Make this return as expected and show some kind of boof empty state
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

    let paymentStatusError: PaymentErrrorResponse | null = null;

    if (paymentRecord.status == PaymentRecordStatus.rejected) {
        paymentStatusError = {
            errorTitle: 'Payment Error', // TODO: Use reason data to populate this
            errorDetail: 'Payment failed', // TODO: Use reason data to populate this
            errorRedirect: paymentRecord.cancelURL, // TODO: Use reason data to populate this, ALSO we should probably use the redirect url here but cancel is kinda ok i guess
        };
    }

    // TODO: Rename these, these are bad
    const responseBodyData = {
        paymentStatus: paymentStatusResponse,
        error: paymentStatusError,
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
