import * as Sentry from '@sentry/serverless';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../errors/invalid-input.error.js';
import { parseAndValidatePaymentTransactionRequest } from '../models/payment-transaction-request.model.js';
import { parseAndValidateTransactionRequestBody } from '../models/transaction-body.model.js';
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
            if (event.body == null) {
                throw new InvalidInputError('Missing body in request');
            }

            let transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));

            const account = transactionRequestBody.account;

            const queryParameters = {
                ...event.queryStringParameters,
                sender: account,
            };
            let paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(queryParameters);

            const transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest);

            const connection = createConnection();

            let transaction = await transactionBuilder.buildPaymentTransaction(connection);

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
            return await createErrorResponse(error);
        }
    },
    {
        captureTimeoutWarning: false,
        rethrowAfterCapture: false,
    },
);
