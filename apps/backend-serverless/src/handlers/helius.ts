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
import { processDiscoveredPaymentTransaction } from '../services/process-discovered-payment-transaction.service.js'
import { processDiscoveredRefundTransaction } from '../services/process-discovered-refund-transaction.service.js'

// TODO: MASSIVE TASK
// This callback returns an array of transactions, if any of these dont work or throw, we need to make sure we
// 1. dont immediatly return, let's parse as many as we can and log what/why didnt work
// 2. set ourselves up to try again later
export const helius = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    let heliusEnhancedTransactions: HeliusEnhancedTransactionArray

    const prisma = new PrismaClient()
    const transactionRecordService = new TransactionRecordService(prisma)

    try {
        heliusEnhancedTransactions = parseAndValidateHeliusEnchancedTransaction(
            event.body
        )
    } catch (error) {
        // Returning an error message here doesn't do much for us now but like I noted at the ending function
        // return, maybe a bad status would get helius to retry for us.
        return requestErrorResponse(error)
    }

    for (const transaction of heliusEnhancedTransactions) {
        try {
            const transactionRecord =
                await transactionRecordService.getTransactionRecord(
                    transaction.signature
                )

            if (transactionRecord == null) {
                throw new Error('Transaction not found.')
            }

            switch (transactionRecord.type) {
                case TransactionType.payment:
                    await processDiscoveredPaymentTransaction(
                        transactionRecord,
                        transaction,
                        prisma
                    )
                case TransactionType.refund:
                    await processDiscoveredRefundTransaction(
                        transactionRecord,
                        transaction,
                        prisma
                    )
            }
        } catch (error) {
            // We will catch here on odd throws, valuable catches should happen elsewhere
            // TODO: Add logging around these odd throws
            return requestErrorResponse(error)
        }
    }

    // This call is from Helius, for now our return value doesn't matter but
    // I wonder if we return bad status codes if that could get them to retry themselves later??
    // How do I tag mert from github
    return {
        statusCode: 200,
        body: JSON.stringify({}, null, 2),
    }
}
