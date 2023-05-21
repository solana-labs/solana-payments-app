import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
    PaymentTransactionBuilder,
    PaymentTransactionRequest,
    parseAndValidatePaymentTransactionRequest,
} from '../models/payment-transaction-request.model.js';
import { decode } from '../utils/strings.util.js';
import queryString from 'querystring';
import { createConnection } from '../utils/connection.util.js';
import { web3 } from '@project-serum/anchor';

export const pay = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let paymentTransactionRequest: PaymentTransactionRequest;
    console.log(event.body);
    const decodedBody = event.body ? decode(event.body) : '';
    console.log(decodedBody);
    const body = queryString.parse(decodedBody);
    const account = body['account'] as string | null;

    if (account == null) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: body }, null, 2),
        };
    }

    if (event.queryStringParameters == null) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'no query' }, null, 2),
        };
    }

    const queryParameters = event.queryStringParameters;

    queryParameters['sender'] = account;

    try {
        paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(queryParameters);
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error, null, 2),
        };
    }

    const transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest);

    const connection = createConnection();

    let transaction: web3.Transaction;

    try {
        transaction = await transactionBuilder.buildPaymentTransaction(connection);
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify(error, null, 2),
        };
    }

    const base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');

    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                transaction: base,
                message: 'message sent',
            },
            null,
            2
        ),
    };
};
