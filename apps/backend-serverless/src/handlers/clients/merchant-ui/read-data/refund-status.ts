import { Merchant, PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    RefundStatusRequest,
    parseAndValidateRefundStatusRequest,
} from '../../../../models/clients/merchant-ui/refund-status-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';
import {
    GeneralResponse,
    createGeneralResponse,
} from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import {
    RefundDataResponse,
    createRefundDataResponseFromRefundRecord,
} from '../../../../utilities/clients/merchant-ui/refund-record.utility.js';
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
        let merchantAuthToken: MerchantAuthToken;
        let refundStatusRequestParameters: RefundStatusRequest;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return createErrorResponse(error);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (merchant == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('merchant'));
        }

        try {
            refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        let refundRecord:
            | (RefundRecord & {
                  paymentRecord: PaymentRecord | null;
              })
            | null;

        try {
            refundRecord = await refundRecordService.getRefundRecordWithPayment({
                shopId: refundStatusRequestParameters.shopId,
            });
        } catch (error) {
            return createErrorResponse(error);
        }

        if (refundRecord == null) {
            return createErrorResponse(new MissingExpectedDatabaseRecordError('refund record'));
        }

        let refundStatusResponse: RefundDataResponse;
        let generalResponse: GeneralResponse;

        try {
            refundStatusResponse = createRefundDataResponseFromRefundRecord(refundRecord);
            generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
        } catch (error) {
            return createErrorResponse(error);
        }

        const responseBodyData = {
            refundStatus: refundStatusResponse,
            general: generalResponse,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(responseBodyData),
        };
    },
    {
        rethrowAfterCapture: false,
    }
);
