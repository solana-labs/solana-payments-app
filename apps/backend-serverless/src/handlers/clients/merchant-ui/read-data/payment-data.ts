import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/token-authenticate.utility.js';
import { PaymentRecordService } from '../../../../services/database/payment-record-service.database.service.js';
import {
    PaymentDataRequestParameters,
    parseAndValidatePaymentDataRequestParameters,
} from '../../../../models/clients/merchant-ui/payment-data-request.model.js';
import { Pagination, DEFAULT_PAGINATION_SIZE } from '../../../../utilities/database-services.utility.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createPaymentDataResponseFromPaymentRecord } from '../../../../utilities/payment-record.utility.js';
import { createGeneralResponse } from '../../../../utilities/create-general-response.js';
import { createPaymentResponse } from '../../../../utilities/create-payment-response.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: 'https://dbf74b8a0a0e4927b9269aa5792d356c@o4505168718004224.ingest.sentry.io/4505168722526208',
    tracesSampleRate: 1.0,
});

export const paymentData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const prisma = new PrismaClient();
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let paymentDataRequestParameters: PaymentDataRequestParameters;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        const merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, ErrorMessage.unknownMerchant);
        }

        try {
            paymentDataRequestParameters = parseAndValidatePaymentDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

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
        };
    },
    {
        rethrowAfterCapture: true,
    }
);
