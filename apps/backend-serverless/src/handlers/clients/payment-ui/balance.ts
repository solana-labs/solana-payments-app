import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { PrismaClient } from '@prisma/client';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility.js';
import {
    BalanceRequestParameters,
    parseAndValidateBalanceParameters,
} from '../../../models/clients/payment-ui/balance-request-parameters.model.js';
import { fetchUsdcSize } from '../../../services/helius.service.js';

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

        let usdcSize: number;

        try {
            usdcSize = await fetchUsdcSize(balanceRequestParameters.pubkey);
        } catch (error) {
            return createErrorResponse(error);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                usdcBalance: usdcSize,
            }),
        };
    }
);
