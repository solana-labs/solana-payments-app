import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { parseAndValidatePaymentTransactionRequest } from '../models/payment-transaction-request.model.js';
import { PaymentTransactionBuilder } from '../services/builders/payment-transaction-ix.builder.js';
import { createConnection } from '../utilities/connection.utility.js';
import { createErrorResponse } from '../utilities/error-response.utility.js';

Sentry.AWSLambda.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
});

export const pay = Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        Sentry.captureEvent({
            message: 'In PAY TRS',
            level: 'info',
            extra: {
                event: event,
            },
        });

        try {
            let paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(event.queryStringParameters);

            const transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest);

            const connection = createConnection();

            let transaction: web3.Transaction = await transactionBuilder.buildPaymentTransaction(connection);

            // TODO create another transaction that mints points

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
                    2,
                ),
            };
        } catch (error) {
            return createErrorResponse(error);
        }
    },
    {
        captureTimeoutWarning: false,
        rethrowAfterCapture: false,
    },
);
