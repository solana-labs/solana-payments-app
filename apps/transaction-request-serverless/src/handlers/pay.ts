import * as Sentry from '@sentry/serverless';
import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../errors/invalid-input.error.js';
import { parseAndValidatePaymentTransactionBody } from '../models/payment-transaction-body.js';
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

        if (event.body == null) {
            return createErrorResponse(new InvalidInputError('missing body in request'));
        }

        try {
            let paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(event.queryStringParameters);

            let paymentTransactionBody = parseAndValidatePaymentTransactionBody(JSON.parse(event.body));

            const transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest, paymentTransactionBody);

            const connection = createConnection();

            let transaction: web3.Transaction = await transactionBuilder.buildPaymentTransaction(connection);

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
