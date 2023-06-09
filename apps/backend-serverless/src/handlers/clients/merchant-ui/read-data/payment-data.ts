import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { Merchant, PrismaClient } from '@prisma/client';
import { MerchantAuthToken } from '../../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { withAuth } from '../../../../utilities/clients/merchant-ui/token-authenticate.utility.js';
import {
    PaymentDataRequestParameters,
    parseAndValidatePaymentDataRequestParameters,
} from '../../../../models/clients/merchant-ui/payment-data-request.model.js';
import { Pagination } from '../../../../utilities/clients/merchant-ui/database-services.utility.js';
import { MerchantService } from '../../../../services/database/merchant-service.database.service.js';
import { createGeneralResponse } from '../../../../utilities/clients/merchant-ui/create-general-response.js';
import { createPaymentResponse } from '../../../../utilities/clients/merchant-ui/create-payment-response.utility.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../../utilities/responses/error-response.utility.js';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

/**
 * @openapi
 * /payment-data:
 *   get:
 *     description: Fetches payments data for the authorized merchant
 *     parameters:
 *       - in: query
 *         name: pageNumber
 *         schema:
 *           type: integer
 *         description: The page number of payments to fetch
 *         required: false
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: The size of the pages you want to fetch
 *         required: false
 *     responses:
 *       200:
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

        let merchant: Merchant | null;

        try {
            merchant = await merchantService.getMerchant({ id: merchantAuthToken.id });
        } catch (error) {
            return errorResponse(ErrorType.internalServerError, ErrorMessage.databaseAccessError);
        }

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

        // TODO: try/catch this
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
