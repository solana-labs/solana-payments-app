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
