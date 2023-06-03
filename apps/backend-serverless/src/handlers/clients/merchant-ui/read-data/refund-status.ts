import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/responses/request-response.utility.js';
import { PrismaClient, RefundRecord } from '@prisma/client';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    RefundDataRequestParameters,
    parseAndValidateRefundDataRequestParameters,
} from '../../../../models/clients/merchant-ui/refund-data-request.model.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createRefundResponse } from '../../../../utilities/clients/merchant-ui/create-refund-response.utility.js';
import {
    parseAndValidateRefundStatusRequest,
    RefundStatusRequest,
} from '../../../../models/clients/merchant-ui/refund-status-request.model.js';
import {
    RefundDataResponse,
    createRefundDataResponseFromRefundRecord,
} from '../../../../utilities/clients/merchant-ui/refund-record.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';

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

        let merchantAuthToken: MerchantAuthToken;
        let refundStatusRequestParameters: RefundStatusRequest;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

        if (merchant == null) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        try {
            refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        const refundRecord = await refundRecordService.getRefundRecordWithPayment({
            shopId: refundStatusRequestParameters.shopId,
        });

        if (refundRecord == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownRefundRecord);
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
    },
    {
        rethrowAfterCapture: true,
    }
);
