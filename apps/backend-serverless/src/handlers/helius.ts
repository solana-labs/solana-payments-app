import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import {
    HeliusEnhancedTransactionArray,
    parseAndValidateHeliusEnchancedTransaction,
} from '../models/helius-enhanced-transaction.model.js'
import { requestErrorResponse } from '../utilities/request-response.utility.js'
import {
    Merchant,
    PrismaClient,
    TransactionRecord,
    TransactionType,
} from '@prisma/client'
import { paymentSessionResolve } from '../services/payment-session-resolve.service.js'
import { refundSessionResolve } from '../services/refund-session-resolve.service.js'
import { PaymentRecordService } from '../services/database/payment-record-service.database.service.js'
import { MerchantService } from '../services/database/merchant-service.database.service.js'
import { RefundRecordService } from '../services/database/refund-record-service.database.service.js'
import { TransactionRecordService } from '../services/database/transaction-record-service.database.service.js'

// TODO: MASSIVE TASK
// This callback returns an array of transactions, if any of these dont work or throw, we need to make sure we
// 1. dont immediatly return, let's parse as many as we can and log what/why didnt work
// 2. set ourselves up to try again later
export const helius = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let heliusEnhancedTransactions: HeliusEnhancedTransactionArray

    const prisma = new PrismaClient()
    const paymentRecordService = new PaymentRecordService(prisma)
    const merchantService = new MerchantService(prisma)
    const refundRecordService = new RefundRecordService(prisma)
    const transactionRecordService = new TransactionRecordService(prisma)

    try {
        heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(
            event.body
        )
    } catch (error) {
        console.log(error)
        return requestErrorResponse(error)
    }

    // this is good, we just have a parsed helius transaction, then we move on to figure out what it is. might want to break up the try/catch for that reason
    // ugh its kind of a problem that we have the for loop inside try catch, lets get for loop on the top level
    for (const transaction of heliusEnhancedTransactions) {
        let transactionRecord: TransactionRecord | null
        let merchantId: number | null
        let merchant: Merchant | null
        let accessToken: string | null
        let shopGid: string | null
        let shop: string

        try {
            const transactionSignature = transaction.signature

            transactionRecord =
                await transactionRecordService.getTransactionRecord(
                    transactionSignature
                )

            if (transactionRecord == null) {
                throw new Error('Transaction not found.')
            }
        } catch (error) {
            return requestErrorResponse(error)
        }

        try {
            switch (transactionRecord.type) {
                case TransactionType.payment:
                    const paymentRecordId = transactionRecord.paymentRecordId

                    if (paymentRecordId == null) {
                        throw new Error(
                            'Payment record not found on transaction record.'
                        )
                    }

                    const paymentRecord =
                        await paymentRecordService.getPaymentRecord({
                            id: paymentRecordId,
                        })

                    if (paymentRecord == null) {
                        throw new Error('Payment record not found.')
                    }

                    merchantId = paymentRecord.merchantId

                    if (merchantId == null) {
                        throw new Error(
                            'Merchant ID not found on payment record.'
                        )
                    }

                    merchant = await merchantService.getMerchant({
                        id: merchantId,
                    })

                    if (merchant == null) {
                        throw new Error('Merchant not found with merchant id.')
                    }

                    accessToken = merchant.accessToken

                    if (accessToken == null) {
                        throw new Error('Access token not found on merchant.')
                    }

                    shopGid = paymentRecord.shopGid

                    if (shopGid == null) {
                        throw new Error('Shop gid not found on payment record.')
                    }

                    shop = merchant.shop

                    const resolvePaymentResponse = await paymentSessionResolve(
                        shopGid,
                        shop,
                        accessToken
                    )

                    const redirectUrl =
                        resolvePaymentResponse.data.paymentSessionResolve
                            .paymentSession.nextAction.context.redirectUrl

                    await paymentRecordService.updatePaymentRecord(
                        paymentRecord,
                        { status: 'paid', redirectUrl: redirectUrl }
                    )

                case TransactionType.refund:
                    const refundRecordId = transactionRecord.refundRecordId

                    if (refundRecordId == null) {
                        throw new Error(
                            'Payment record not found on transaction record.'
                        )
                    }

                    const refundRecord =
                        await refundRecordService.getRefundRecord({
                            id: refundRecordId,
                        })

                    if (refundRecord == null) {
                        throw new Error('Refund record not found.')
                    }

                    merchantId = refundRecord.merchantId

                    if (merchantId == null) {
                        throw new Error(
                            'Merchant ID not found on refund record.'
                        )
                    }

                    merchant = await merchantService.getMerchant({
                        id: merchantId,
                    })

                    if (merchant == null) {
                        throw new Error('Merchant not found with merchant id.')
                    }

                    accessToken = merchant.accessToken

                    if (accessToken == null) {
                        throw new Error('Access token not found on merchant.')
                    }

                    shopGid = refundRecord.shopGid

                    if (shopGid == null) {
                        throw new Error('Shop gid not found on refund record.')
                    }

                    shop = merchant.shop

                    const resolveRefunndResponse = await refundSessionResolve(
                        shopGid,
                        shop,
                        accessToken
                    )

                    // TODO: check values from resolveRefundResponse here
                    // TODO: refundRecordService update refundRecord.update
                    await refundRecordService.updateRefundRecord(refundRecord, {
                        status: 'paid',
                    })
            }
        } catch (error) {
            return requestErrorResponse(error)
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({}, null, 2),
    }
}
