import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
} from '@prisma/client';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/clients/payment-ui/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';
import { paymentSessionRejectionDisplayMessages } from '../../../services/shopify/payment-session-reject.service.js';

// TODO: Find somewhere to put this
interface PaymentErrrorResponse {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
}

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const paymentStatus = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        let parsedPaymentStatusQuery: PaymentStatusRequest;

        const merchantService = new MerchantService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);

        try {
            parsedPaymentStatusQuery = await parseAndValidatePaymentStatusRequest(event.queryStringParameters);
        } catch (error: unknown) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: parsedPaymentStatusQuery.paymentId,
            });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        // TODO: Make this return as expected and show some kind of boof empty state
        if (paymentRecord == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        // TODO: Make this return as expected and show some kind of boof empty state
        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownPaymentRecord);
        }

        const paymentStatusResponse = {
            merchantDisplayName: merchant.name ?? merchant.shop.split('.')[0],
            totalAmountFiatDisplay: paymentRecord.amount.toLocaleString(parsedPaymentStatusQuery.language, {
                style: 'currency',
                currency: paymentRecord.currency,
            }),
            totalAmountUSDCDisplay: `${paymentRecord.usdcAmount.toFixed(2)} USDC`,
            cancelUrl: paymentRecord.cancelURL,
            redirectUrl: paymentRecord.redirectUrl,
            completed: paymentRecord.redirectUrl ? true : false,
        };

        let paymentStatusError: PaymentErrrorResponse | null = null;

        if (paymentRecord.status == PaymentRecordStatus.rejected) {
            const rejectionReason = paymentRecord.rejectionReason ?? PaymentRecordRejectionReason.unknownReason;
            const rejectionReasonDisplayMesages = paymentSessionRejectionDisplayMessages(rejectionReason);

            paymentStatusError = {
                errorTitle: rejectionReasonDisplayMesages.errorTitle,
                errorDetail: rejectionReasonDisplayMesages.errorDescription,
                errorRedirect: paymentRecord.redirectUrl ?? paymentRecord.cancelURL, // TODO: Use reason data to populate this, ALSO we should probably use the redirect url here but cancel is kinda ok i guess
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
            // headers: {
            //     'Access-Control-Allow-Origin': '*',
            //     'Access-Control-Allow-Credentials': true,
            // },
        };
    }
);
