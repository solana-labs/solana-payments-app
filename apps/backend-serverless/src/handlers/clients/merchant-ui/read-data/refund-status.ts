import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidateRefundStatusRequest } from '../../../../models/clients/merchant-ui/refund-status-request.model';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response';
import { createRefundDataResponseFromRefundRecord } from '../../../../utilities/clients/merchant-ui/refund-record.utility';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refundStatus = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const refundRecordService = new RefundRecordService(prisma);

        Sentry.captureEvent({
            message: 'in refund-status',
            level: 'info',
        });

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);

            const refundRecord = await refundRecordService.getRefundRecordWithPayment({
                shopId: refundStatusRequestParameters.shopId,
            });

            const refundStatusResponse = createRefundDataResponseFromRefundRecord(refundRecord);
            const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
            const responseBodyData = {
                refundStatus: refundStatusResponse,
                general: generalResponse,
            };

            return {
                statusCode: 200,
                body: JSON.stringify(responseBodyData),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        rethrowAfterCapture: false,
    }
);
