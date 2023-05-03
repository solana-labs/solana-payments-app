import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { PaymentRecord, PrismaClient } from '@prisma/client'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import {
    parseAndValidatePaymentStatusRequest,
    PaymentStatusRequest,
    PaymentStatusResponse,
} from '../models/payment-status.model.js'
import { payment } from './payment.js'

const prisma = new PrismaClient()

export const paymentStatus = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let parsedPaymentStatusQuery: PaymentStatusRequest
    let paymentRecord: PaymentRecord | null

    const prisma = new PrismaClient()

    try {
        parsedPaymentStatusQuery = await parseAndValidatePaymentStatusRequest(
            event.queryStringParameters
        )
    } catch (error: unknown) {
        return requestErrorResponse(error)
    }

    try {
        paymentRecord = await prisma.paymentRecord.findFirst({
            where: {
                id: parsedPaymentStatusQuery.id,
            },
        })

        if (paymentRecord == null) {
            return requestErrorResponse(
                // TODO: Create a custom error type for this.
                new Error(`Could not find payment.`)
            )
        }
    } catch (error) {
        return requestErrorResponse(error)
    }

    const paymentStatusResponse = {
        merchantDisplayName: 'Starbucks Coffee',
        totalAmountFiatDisplay: `${paymentRecord.amount} ${paymentRecord.currency}`,
        totalAmountUSDCDisplay: `${paymentRecord.amount} ${paymentRecord.currency}`,
        cancelUrl: paymentRecord.cancelURL,
        completed: false,
    }

    return {
        statusCode: 200,
        body: JSON.stringify(paymentStatusResponse, null, 2),
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
    }
}
