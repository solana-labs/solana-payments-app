import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidatePaymentStatusRequest } from '../../../models/clients/payment-ui/payment-status-request.model';
import { MerchantService } from '../../../services/database/merchant-service.database.service';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service';
import { createLoyaltyResponse } from '../../../utilities/clients/merchant-ui/create-loyalty-response.utility';
import {
    createPaymentErrorResponse,
    createPaymentStatusResponse,
} from '../../../utilities/clients/payment-ui/create-payment-status-response.utility';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility';

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

            const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });
            const loyaltyResponse = createLoyaltyResponse(merchant);
            const paymentStatusResponse = createPaymentStatusResponse(
                paymentRecord,
                merchant,
                parsedPaymentStatusQuery.language
            );
            const paymentErrorResponse = createPaymentErrorResponse(paymentRecord);
            const responseBodyData = {
                paymentStatus: paymentStatusResponse,
                error: paymentErrorResponse,
                loyaltyDetails: loyaltyResponse,
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
