import { Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    RefundDataRequestParameters,
    parseAndValidateRefundDataRequestParameters,
} from '../../../../models/clients/merchant-ui/refund-data-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createRefundResponse } from '../../../../utilities/clients/merchant-ui/create-refund-response.utility.js';
import { Pagination } from '../../../../utilities/clients/merchant-ui/database-services.utility.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const refundData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let refundDataRequestParameters: RefundDataRequestParameters;

        try {
            merchantAuthToken = withAuth(event.cookies);
        } catch (error) {
            return errorResponse(ErrorType.unauthorized, ErrorMessage.unauthorized);
        }

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

        if (merchant == null) {
            return errorResponse(ErrorType.notFound, merchantAuthToken.id);
        }

        try {
            refundDataRequestParameters = parseAndValidateRefundDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        const pagination: Pagination = {
            page: refundDataRequestParameters.pageNumber,
            pageSize: refundDataRequestParameters.pageSize,
        };

        // TODO: try/catch this
        const refundResponse = await createRefundResponse(
            merchantAuthToken,
            refundDataRequestParameters.refundStatus,
            pagination,
            prisma
        );
        const generalResponse = await createGeneralResponse(merchantAuthToken, prisma);

        const responseBodyData = {
            refundData: refundResponse,
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
    },
    {
        rethrowAfterCapture: true,
    }
);
