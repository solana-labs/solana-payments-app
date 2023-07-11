import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import {
    PaymentTransactionBuilder,
    PaymentTransactionRequest,
    parseAndValidatePaymentTransactionRequest,
} from '../models/payment-transaction-request.model.js';
import { createConnection } from '../utils/connection.util.js';

export const pay = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    let paymentTransactionRequest: PaymentTransactionRequest;

    if (event.body == null) {
        return {
            statusCode: 501,
            body: JSON.stringify({ error: 'fuck' }, null, 2),
        };
    }

    const body = JSON.parse(event.body);
    const account = body['account'] as string | null;

    if (account == null) {
        return {
            statusCode: 507,
            body: JSON.stringify({ error: 'fuck' }, null, 2),
        };
    }

    if (event.queryStringParameters == null) {
        return {
            statusCode: 509,
            body: JSON.stringify({ message: 'damn' }, null, 2),
        };
    }

    const queryParameters = event.queryStringParameters;

    queryParameters['sender'] = account;

    try {
        paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(queryParameters);
    } catch (error) {
        // console.log(error);
        return {
            statusCode: 503,
            body: JSON.stringify({ message: 'bufff' }, null, 2),
        };
    }

    // console.log(paymentTransactionRequest);
    // console.log(paymentTransactionRequest.receiverTokenAddress);
    // console.log(paymentTransactionRequest.receiverWalletAddress);

    const transactionBuilder = new PaymentTransactionBuilder(paymentTransactionRequest);

    const connection = createConnection();

    let transaction: web3.Transaction;

    try {
        transaction = await transactionBuilder.buildPaymentTransaction(connection);
    } catch (error) {
        // console.log(error);
        return {
            statusCode: 504,
            body: JSON.stringify({ message: 'ahhh' }, null, 2),
        };
    }

    let base: string;

    try {
        base = transaction.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64');
    } catch {
        return {
            statusCode: 505,
            body: JSON.stringify({ message: 'grrr' }, null, 2),
        };
    }

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
