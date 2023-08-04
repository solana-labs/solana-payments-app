import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidateCustomerDataRequest } from '../../../models/clients/payment-ui/customer-data-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { createCustomerResponse } from '../../../utilities/clients/create-customer-response.js';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const customerData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in customerData',
            level: 'info',
            extra: {
                event,
            },
        });

        const paymentRecordService = new PaymentRecordService(prisma);
        const merchantService = new MerchantService(prisma);

        try {
            const customerDataRequest = await parseAndValidateCustomerDataRequest(event.queryStringParameters);

            const paymentRecord = await paymentRecordService.getPaymentRecord({
                id: customerDataRequest.paymentId,
            });

            const customerResponse = await createCustomerResponse(
                customerDataRequest.customerWallet,
                paymentRecord,
                merchantService
            );

            return {
                statusCode: 200,
                body: JSON.stringify({ customerResponse }),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
