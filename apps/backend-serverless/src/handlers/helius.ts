import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    HeliusEnhancedTransaction,
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../models/helius-enhanced-transaction.model.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import { PrismaClient } from '@prisma/client'
import { payment } from './payment.js'
import { paymentSessionResolve } from '../services/payment-session-resolve.service.js'

const prisma = new PrismaClient()

export const helius = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let heliusEnhancedTransactions: HeliusEnhancedTransactionArray

    try {
        heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(
            event.body
        )
    } catch (error) {
        console.log(error)
        return requestErrorResponse(error)
    }

    try {
        for (const transaction of heliusEnhancedTransactions) {
            const transactionSignature = transaction.signature

            const transactionRecord = await prisma.transactionRecord.findFirst({
                where: {
                    signature: transactionSignature,
                },
            })

            if (transactionRecord == null) {
                throw new Error('Transaction not found.')
            }

            const paymentRecordId = transactionRecord.paymentRecordId

            if (paymentRecordId == null) {
                throw new Error(
                    'Payment record not found on transaction record.'
                )
            }

            const paymentRecord = await prisma.paymentRecord.findFirst({
                where: {
                    id: paymentRecordId,
                },
            })

            if (paymentRecord == null) {
                throw new Error('Payment record not found.')
            }

            // At this point we found a transaction, we should move it to a paid state here to handle failures with shopify

            const merchantId = paymentRecord.merchantId

            if (merchantId == null) {
                throw new Error('Merchant ID not found on payment record.')
            }

            const merchant = await prisma.merchant.findFirst({
                where: {
                    id: merchantId,
                },
            })

            if (merchant == null) {
                throw new Error('Merchant not found with merchant id.')
            }

            const accessToken = merchant.accessToken

            if (accessToken == null) {
                throw new Error('Access token not found on merchant.')
            }

            const shopGid = paymentRecord.shopGid

            if (shopGid == null) {
                throw new Error('Shop gid not found on payment record.')
            }

            const shop = merchant.shop

            const resolvePaymentResponse = await paymentSessionResolve(
                shopGid,
                shop,
                accessToken
            )

            const redirectUrl =
                resolvePaymentResponse.data.paymentSessionResolve.paymentSession
                    .nextAction.context.redirectUrl

            await prisma.paymentRecord.update({
                where: {
                    id: paymentRecordId,
                },
                data: {
                    status: 'paid',
                    redirectUrl: redirectUrl,
                },
            })
        }
    } catch (error) {
        console.log(error)
        return requestErrorResponse(error)
    }

    return {
        statusCode: 200,
        body: JSON.stringify({}, null, 2),
    }
}
