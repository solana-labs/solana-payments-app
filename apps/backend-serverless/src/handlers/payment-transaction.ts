import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PaymentRecord, PrismaClient } from '@prisma/client'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { PaymentTransactionResponse } from '../models/payment-transaction-response.model.js'
import { fetchPaymentTransaction } from '../services/fetch-payment-transaction.service.js'
import {
    PaymentTransactionRequest,
    parseAndValidatePaymentTransactionRequest,
} from '../models/payment-transaction-request.model.js'
import { decode } from '../utilities/string.utility.js'
import queryString from 'query-string'

const prisma = new PrismaClient()

export const paymentTransaction = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let paymentRecord: PaymentRecord
    let paymentTransaction: PaymentTransactionResponse
    let paymentRequest: PaymentTransactionRequest

    const decodedBody = event.body ? decode(event.body) : ''
    const body = queryString.parse(decodedBody)
    const account = body['account'] as string | null

    if (account == null) {
        return requestErrorResponse(new Error('No account provided.'))
    }

    try {
        paymentRequest = parseAndValidatePaymentTransactionRequest(
            event.queryStringParameters
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    try {
        paymentRecord = await prisma.paymentRecord.findFirstOrThrow({
            where: {
                id: 1,
            },
        })
    } catch (error) {
        return requestErrorResponse(error)
    }

    try {
        paymentTransaction = await fetchPaymentTransaction(
            paymentRecord,
            account
        )
    } catch (error) {
        return requestErrorResponse(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify(paymentTransaction, null, 2),
    }
}
