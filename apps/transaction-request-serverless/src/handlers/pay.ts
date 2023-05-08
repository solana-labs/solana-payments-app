<<<<<<< HEAD
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PayRequest } from "../models/pay-request.model.js";
import {
  createPayTransaction,
  createSamplePayRequest,
} from "../utils/create-pay-transaction.util.js";
import {
  PaymentTransactionRequest,
  parseAndValidatePaymentTransactionRequest,
} from "../models/payment-transaction-request.model.js";
import { decode } from "../utils/strings.util.js";
import queryString from "querystring";

export const pay = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let payRequest: PayRequest;
  let paymentTransactionRequest: PaymentTransactionRequest;
  const decodedBody = event.body ? decode(event.body) : "";
  const body = queryString.parse(decodedBody);
  const account = body["account"] as string | null;

  if (account == null) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: body }, null, 2),
    };
  }

  try {
    paymentTransactionRequest = parseAndValidatePaymentTransactionRequest(
      event.queryStringParameters
    );
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error, null, 2),
    };
  }

  try {
    payRequest = PayRequest.parse({
      receiver: paymentTransactionRequest.receiver,
      sender: account,
      sendingToken: paymentTransactionRequest.sendingToken,
      receivingToken: paymentTransactionRequest.receivingToken,
      feePayer: paymentTransactionRequest.feePayer,
      receivingAmount: paymentTransactionRequest.receivingAmount,
      amountType: paymentTransactionRequest.amountType,
      transactionType: paymentTransactionRequest.transactionType,
      createAta: paymentTransactionRequest.createAta,
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error, null, 2),
    };
  }

  // const request = createSamplePayRequest()

  const transaction = await createPayTransaction(payRequest);

  const base = transaction
    .serialize({ requireAllSignatures: false, verifySignatures: false })
    .toString("base64");

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        transaction: base,
        message: "message sent",
      },
      null,
      2
    ),
  };
};
=======
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PayRequest } from '../models/pay-request.model.js'
import {
    createPayTransaction,
    createSamplePayRequest,
} from '../utils/create-pay-transaction.util.js'

export const pay = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let payRequest: PayRequest

    // const queryStringParameters = event.queryStringParameters
    // const bodyObject = event.body ? JSON.parse(event.body) : {}

    // try {
    //     payRequest = PayRequest.parse({
    //         receiver: queryStringParameters
    //             ? queryStringParameters['reveiver']
    //             : undefined,
    //         sender: bodyObject['account'],
    //         sendingToken: queryStringParameters
    //             ? queryStringParameters['sendingToken']
    //             : undefined,
    //         receivingToken: queryStringParameters
    //             ? queryStringParameters['receivingToken']
    //             : undefined,
    //         feePayer: queryStringParameters
    //             ? queryStringParameters['feePayer']
    //             : undefined,
    //         receivingAmount: queryStringParameters
    //             ? queryStringParameters['receivingAmount']
    //             : undefined,
    //         amountType: queryStringParameters
    //             ? queryStringParameters['amountType']
    //             : undefined,
    //         transactionType: queryStringParameters
    //             ? queryStringParameters['transactionType']
    //             : undefined,
    //         createAta: queryStringParameters
    //             ? queryStringParameters['createAta']
    //             : undefined,
    //     })
    // } catch (error) {
    //     return {
    //         statusCode: 500,
    //         body: JSON.stringify(
    //             {
    //                 hello: 'error',
    //             },
    //             null,
    //             2
    //         ),
    //     }
    // }

    const request = createSamplePayRequest()

    const transaction = await createPayTransaction(request)

    const base = transaction
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString('base64')

    return {
        statusCode: 500,
        body: JSON.stringify(
            {
                transaction: base,
                message: 'message',
            },
            null,
            2
        ),
    }
}
>>>>>>> main
