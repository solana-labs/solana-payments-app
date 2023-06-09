import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Merchant, PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import {
    parseAndValidateRefundStatusRequest,
    RefundStatusRequest,
} from '../../../../models/clients/merchant-ui/refund-status-request.model.js';
import { createRefundDataResponseFromRefundRecord } from '../../../../utilities/clients/merchant-ui/refund-record.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { RefundRecordService } from '../../../../services/database/refund-record-service.database.service.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

/**
 * @openapi
 * /refund-status:
 *   get:
 *     description: Fetches refunds data for the authorized merchant
 *     responses:
 *       200:s
 *        description: Success
 *       401:
 *        description: No cookie provided. Please provide a valid signed cookie to access the resource.
 *       403:
 *        description: Invalid cookie. Your cookie may have expired or is not valid.
 *       404:
 *        description: Merchant is not found
 *       409:
 *        description: Database access error
 *       500:
 *        description: Internal server error
 *
 */
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

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        try {
            refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
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
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (refundRecord == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownRefundRecord);
        }

        // TODO: Try/catch this
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
