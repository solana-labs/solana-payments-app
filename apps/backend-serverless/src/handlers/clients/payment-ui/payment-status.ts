import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Merchant, PaymentRecord, PrismaClient } from '@prisma/client';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/clients/payment-ui/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import { MissingExpectedDatabaseRecordError } from '../../../errors/missing-expected-database-record.error.js';
import {
    PaymentErrrorResponse,
    PaymentStatusResponse,
    createPaymentErrorResponse,
    createPaymentStatusResponse,
} from '../../../utilities/clients/payment-ui/create-payment-status-response.utility.js';

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
        } catch (error) {
            return createErrorResponse(error);
        }

        let paymentRecord: PaymentRecord | null;

        try {
            paymentRecord = await paymentRecordService.getPaymentRecord({
                id: parsedPaymentStatusQuery.paymentId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (paymentRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('payment record'));
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({
                id: paymentRecord.merchantId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        let paymentStatusResponse: PaymentStatusResponse;
        let paymentErrorResponse: PaymentErrrorResponse | null;

        try {
            paymentStatusResponse = createPaymentStatusResponse(
                paymentRecord,
                merchant,
                parsedPaymentStatusQuery.language
            );
            paymentErrorResponse = createPaymentErrorResponse(paymentRecord);
        } catch (error) {
            return createErrorResponse(error);
        }

        const responseBodyData = {
            paymentStatus: paymentStatusResponse,
            error: paymentErrorResponse,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(responseBodyData),
        };
    }
);
