import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidateBalanceParameters } from '../../../models/clients/payment-ui/balance-request-parameters.model';
import { fetchBalance } from '../../../services/helius.service';
import { createErrorResponse } from '../../../utilities/responses/error-response.utility';

const prisma = new PrismaClient();

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});

export const balance = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'in balance',
            level: 'info',
        });
        try {
            const balanceRequestParameters = await parseAndValidateBalanceParameters(event.queryStringParameters);

            const tokenSize = await fetchBalance(balanceRequestParameters.publicKey, balanceRequestParameters.mint);

            return {
                statusCode: 200,
                body: JSON.stringify({
                    tokenBalance: tokenSize,
                }),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    }
);
