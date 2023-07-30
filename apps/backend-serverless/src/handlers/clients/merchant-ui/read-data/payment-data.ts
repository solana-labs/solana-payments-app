import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidatePaymentDataRequestParameters } from '../../../../models/clients/merchant-ui/payment-data-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/create-general-response.js';
import { createPaymentResponse } from '../../../../utilities/clients/create-payment-response.utility.js';
import { Pagination } from '../../../../utilities/clients/database-services.utility.js';
import { withAuth } from '../../../../utilities/clients/token-authenticate.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const paymentData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        Sentry.captureEvent({
            message: 'in payment-data',
            level: 'info',
        });

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

            const paymentDataRequestParameters = parseAndValidatePaymentDataRequestParameters(
                event.queryStringParameters
            );
            const pagination: Pagination = {
                page: paymentDataRequestParameters.pageNumber,
                pageSize: paymentDataRequestParameters.pageSize,
            };

            const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
            const paymentResponse = await createPaymentResponse(merchantAuthToken, pagination, prisma);
            const responseBodyData = {
                paymentData: paymentResponse,
                general: generalResponse,
            };

            return {
                statusCode: 200,
                body: JSON.stringify(responseBodyData),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
