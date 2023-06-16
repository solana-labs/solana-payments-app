import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import {
    BalanceRequestParameters,
    parseAndValidateBalanceParameters,
} from '../../../models/clients/payment-ui/balance-request-parameters.model.js';
<<<<<<< HEAD
import { fetchUsdcBalance, fetchUsdcSize } from '../../../services/helius.service.js';
=======
import { fetchUsdcBalance } from '../../../services/helius.service.js';
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))

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
        } catch (error) {
            return createErrorResponse(error);
        }

<<<<<<< HEAD
        let usdcSize: number;

        try {
            usdcSize = await fetchUsdcSize(balanceRequestParameters.pubkey);
=======
        let usdcBalance: string;

        try {
            usdcBalance = await fetchUsdcBalance(balanceRequestParameters.pubkey);
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))
        } catch (error) {
            return createErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
<<<<<<< HEAD
                usdcBalance: usdcSize,
=======
                usdcBalance: usdcBalance,
>>>>>>> 5522baa (added favicon and domain correctly goes to pay.solanapay.com (#306))
            }),
        };
    }
);
