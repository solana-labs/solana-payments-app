import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
} from '@prisma/client';
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
} from '../../../models/clients/payment-ui/payment-status-request.model.js';
import { MerchantService } from '../../../services/database/merchant-service.database.service.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';
import { ErrorMessage, ErrorType, errorResponse } from '../../../utilities/responses/error-response.utility.js';
import { paymentSessionRejectionDisplayMessages } from '../../../services/shopify/payment-session-reject.service.js';
import {
    BalanceRequestParameters,
    parseAndValidateBalanceParameters,
} from '../../../models/clients/payment-ui/balance-request-parameters.model.js';
import { fetchUsdcBalance } from '../../../services/helius.service.js';

// TODO: Find somewhere to put this
interface PaymentErrrorResponse {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
}

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const balance = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        let balanceRequestParameters: BalanceRequestParameters;

        try {
            balanceRequestParameters = await parseAndValidateBalanceParameters(event.queryStringParameters);
        } catch (error: unknown) {
            return errorResponse(ErrorType.badRequest, ErrorMessage.invalidRequestParameters);
        }

        const usdcBalance = await fetchUsdcBalance(balanceRequestParameters.pubkey);

        const responseBodyData = {
            usdcBalance: usdcBalance,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(responseBodyData),
        };
    }
);
