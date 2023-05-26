import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient, RefundRecord } from '@prisma/client';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { MerchantAuthToken } from '../../../../models/merchant-auth-token.model.js';
import {
    RefundDataRequestParameters,
    parseAndValidateRefundDataRequestParameters,
} from '../../../../models/refund-data-request.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { createGeneralResponse } from '../../../../utilities/create-general-response.js';
import { createRefundResponse } from '../../../../utilities/create-refund-response.utility.js';
import {
    parseAndValidateRefundStatusRequest,
    RefundStatusRequest,
} from '../../../../models/refund-status-request.model.js';
import { createRefundStatusResponse } from '../../../../utilities/create-refund-status-response.utility.js';
import { RefundDataResponse } from '../../../../utilities/refund-record.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const refundStatus = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let refundStatusRequestParameters: RefundStatusRequest;
        let refundStatusResponse: RefundDataResponse;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return requestErrorResponse(error);
        }

        const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

        if (merchant == null) {
            return requestErrorResponse(new Error('Could not find merchant.'));
        }

        try {
            refundStatusRequestParameters = parseAndValidateRefundStatusRequest(event.queryStringParameters);
        } catch (error) {
            return requestErrorResponse(error);
        }

        try {
            refundStatusResponse = await createRefundStatusResponse(refundStatusRequestParameters.shopId, prisma);
        } catch (error) {
            return requestErrorResponse(error);
        }

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
