import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MissingExpectedDatabaseRecordError } from '../../../errors/missing-expected-database-record.error.js';
import { parseAndValidatePaymentStatusRequest } from '../../../models/clients/payment-ui/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import {
    createPaymentErrorResponse,
    createPaymentStatusResponse,
} from '../../../utilities/clients/payment-ui/create-payment-status-response.utility.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const paymentStatus = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in payment-status',
            level: 'info',
        });

        const merchantService = new MerchantService(prisma);
        const paymentRecordService = new PaymentRecordService(prisma);

        try {
            const parsedPaymentStatusQuery = await parseAndValidatePaymentStatusRequest(event.queryStringParameters);

            const paymentRecord = await paymentRecordService.getPaymentRecord({
                id: parsedPaymentStatusQuery.paymentId,
            });

            if (paymentRecord == null) {
                return createErrorResponse(new MissingExpectedDatabaseRecordError('payment record'));
            }

            const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });
            if (merchant == null) {
                return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
            }
            const paymentStatusResponse = createPaymentStatusResponse(
                paymentRecord,
                merchant,
                parsedPaymentStatusQuery.language
            );
            const paymentErrorResponse = createPaymentErrorResponse(paymentRecord);
            const responseBodyData = {
                paymentStatus: paymentStatusResponse,
                error: paymentErrorResponse,
            };

            return {
                statusCode: 200,
                body: JSON.stringify(responseBodyData),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
