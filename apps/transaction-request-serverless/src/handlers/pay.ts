import * as web3 from '@solana/web3.js';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { InvalidInputError } from '../errors/invalid-input.error.js';
import {
    PaymentTransactionBuilder,
    PaymentTransactionRequest,
    parseAndValidatePaymentTransactionRequest,
} from '../models/payment-transaction-request.model.js';
import { TransactionRequestBody, parseAndValidateTransactionRequestBody } from '../models/transaction-body.model.js';
import { createErrorResponse } from '../utilities/error-response.utility.js';
import { createConnection } from '../utils/connection.util.js';

export const pay = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
    let paymentTransactionRequest: PaymentTransactionRequest;

    if (event.body == null) {
        return createErrorResponse(new InvalidInputError('Missing body in request'));
    }

    let transactionRequestBody: TransactionRequestBody;

    try {
        transactionRequestBody = parseAndValidateTransactionRequestBody(JSON.parse(event.body));
    } catch (error) {
        return createErrorResponse(error);
    }
    const account = transactionRequestBody.account;

    if (account == null) {
        return createErrorResponse(new InvalidInputError('missing account in body'));
    }

    try {
        const queryParameters = {
            ...event.queryStringParameters,
            sender: account,
        };
        paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(queryParameters);
    } catch (error) {
        return createErrorResponse(error);
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
    } catch (error) {
        return createErrorResponse(error);
    }

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
};
