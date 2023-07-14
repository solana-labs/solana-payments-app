import { PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';
import { parseAndValidateRefundStatusRequest } from '../../../../models/clients/merchant-ui/refund-status-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createRefundDataResponseFromRefundRecord } from '../../../../utilities/clients/merchant-ui/refund-record.utility.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refundStatus = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);
        const refundRecordService = new RefundRecordService(prisma);

        Sentry.captureEvent({
            message: 'in refund-status',
            level: 'info',
        });

        try {
            const merchantAuthToken = withAuth(event.cookies);
            const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
            const refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);

            const refundRecord:
                | (RefundRecord & {
                      paymentRecord: PaymentRecord | null;
                  })
                | null = await refundRecordService.getRefundRecordWithPayment({
                shopId: refundStatusRequestParameters.shopId,
            });
            if (refundRecord == null) {
                throw new MissingExpectedDatabaseRecordError('refund record');
            }

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
