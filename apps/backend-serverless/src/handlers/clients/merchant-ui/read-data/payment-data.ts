import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { requestErrorResponse } from '../../../../utilities/responses/request-response.utility.js';
import { PrismaClient } from '@prisma/client';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { PaymentRecordService } from '../../../../services/database/payment-record-service.database.service.js';
import {
    PaymentDataRequestParameters,
    parseAndValidatePaymentDataRequestParameters,
} from '../../../../models/clients/merchant-ui/payment-data-request.model.js';
import {
    Pagination,
    DEFAULT_PAGINATION_SIZE,
} from '../../../../utilities/clients/merchant-ui/database-services.utility.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createPaymentDataResponseFromPaymentRecord } from '../../../../utilities/clients/merchant-ui/payment-record.utility.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createPaymentResponse } from '../../../../utilities/clients/merchant-ui/create-payment-response.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const paymentData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
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
