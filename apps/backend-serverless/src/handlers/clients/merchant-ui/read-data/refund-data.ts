import { Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    RefundDataRequestParameters,
    parseAndValidateRefundDataRequestParameters,
} from '../../../../models/clients/merchant-ui/refund-data-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import {
    GeneralResponse,
    createGeneralResponse,
} from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import {
    RefundResponse,
    createRefundResponse,
} from '../../../../utilities/clients/merchant-ui/create-refund-response.utility.js';
import { Pagination } from '../../../../utilities/clients/merchant-ui/database-services.utility.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import { createErrorResponse } from '../../../../utilities/responses/error-response.utility.js';
import { MissingExpectedDatabaseRecordError } from '../../../../errors/missing-expected-database-record.error.js';

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
            refundDataRequestParameters = parseAndValidateRefundDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        const pagination: Pagination = {
            page: refundDataRequestParameters.pageNumber,
            pageSize: refundDataRequestParameters.pageSize,
        };

        let refundResponse: RefundResponse;
        let generalResponse: GeneralResponse;

        try {
            refundResponse = await createRefundResponse(
                merchantAuthToken,
                refundDataRequestParameters.refundStatus,
                pagination,
                prisma
            );
            generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
        } catch (error) {
            return createErrorResponse(error);
        }

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
