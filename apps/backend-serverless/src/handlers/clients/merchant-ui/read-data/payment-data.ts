import { Merchant, PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import {
    PaymentDataRequestParameters,
    parseAndValidatePaymentDataRequestParameters,
} from '../../../../models/clients/merchant-ui/payment-data-request.model.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import {
    GeneralResponse,
    createGeneralResponse,
} from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import {
    PaymentResponse,
    createPaymentResponse,
} from '../../../../utilities/clients/merchant-ui/create-payment-response.utility.js';
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

export const paymentData = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const merchantService = new MerchantService(prisma);

        let merchantAuthToken: MerchantAuthToken;
        let paymentDataRequestParameters: PaymentDataRequestParameters;

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
            paymentDataRequestParameters = parseAndValidatePaymentDataRequestParameters(event.queryStringParameters);
        } catch (error) {
            return createErrorResponse(error);
        }

        const pagination: Pagination = {
            page: paymentDataRequestParameters.pageNumber,
            pageSize: paymentDataRequestParameters.pageSize,
        };

        let generalResponse: GeneralResponse;
        let paymentResponse: PaymentResponse;

        try {
            generalResponse = await createGeneralResponse(merchantAuthToken, prisma);
            paymentResponse = await createPaymentResponse(merchantAuthToken, pagination, prisma);
        } catch (error) {
            return createErrorResponse(error);
        }

        const responseBodyData = {
            paymentData: paymentResponse,
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
