import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidatePointsSetupTransactionRequest } from '../models/points-setup-transaction-request.model.js';
import { PointsSetupTransactionBuilder } from '../services/builders/points-setup-transaction-ix.builder.js';
import { createConnection } from '../utilities/connection.utility.js';
import { createErrorResponse } from '../utilities/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const pointsSetup = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In TRS points Setup',
            level: 'info',
            extra: {
                event: event,
            },
        });

        try {
            let pointsSetupTransactionRequest = parseAndValidatePointsSetupTransactionRequest(
                event.queryStringParameters
            );

            const transactionBuilder = new PointsSetupTransactionBuilder(pointsSetupTransactionRequest);

            const connection = createConnection();

            let transaction: web3.Transaction = await transactionBuilder.buildPointsSetupTransaction(connection);

            let base = transaction
                .serialize({ requireAllSignatures: false, verifySignatures: false })
                .toString('base64');

            return {
                statusCode: 200,
                body: JSON.stringify(
                    {
                        transaction: base,
                        message: 'Tranasction created successfully',
                    },
                    null,
                    2
                ),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        captureTimeoutWarning: false,
        rethrowAfterCapture: false,
    }
);
