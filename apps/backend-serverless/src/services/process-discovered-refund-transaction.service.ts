import {
    PrismaClient,
    TransactionRecord,
    TransactionType,
} from '@prisma/client'
import { HeliusEnhancedTransaction } from '../models/helius-enhanced-transaction.model.js'
import { RefundRecordService } from './database/refund-record-service.database.service.js'
import { MerchantService } from './database/merchant-service.database.service.js'
import { refundSessionResolve } from './refund-session-resolve.service.js'

// I'm not sure I love adding prisma into this but it should work for how we're handling testing now
export const processDiscoveredRefundTransaction = async (
    transactionRecord: TransactionRecord,
    transaction: HeliusEnhancedTransaction,
    prisma: PrismaClient
) => {
    // we should probably do some validation here to make sure the transaction
    // actually matches the refund record that the transaction is associated with
    // for now i will ignore that, mocked the function for now
    validateDiscoveredPaymentTransaction(transactionRecord, transaction)

    const refundRecordService = new RefundRecordService(prisma)
    const merchantService = new MerchantService(prisma)

    // Verify the transaction is a refund
    if (transactionRecord.type != TransactionType.refund) {
        throw new Error('Transaction record is not a refund')
    }

    // catching this error here and throwing will just give it back to /helius but then at least
    // that consolidates weird errors for logging into one place
    if (transactionRecord.refundRecordId == null) {
        throw new Error('Payment record not found on transaction record.')
    }

    const refundRecord = await refundRecordService.getRefundRecord({
        id: transactionRecord.refundRecordId,
    })

    if (refundRecord == null) {
        throw new Error('Refund record not found.')
    }

    if (refundRecord.shopGid == null) {
        throw new Error('Shop gid not found on refund record.')
    }

    if (refundRecord.merchantId == null) {
        throw new Error('Merchant ID not found on refund record.')
    }

    const merchant = await merchantService.getMerchant({
        id: refundRecord.merchantId,
    })

    if (merchant == null) {
        throw new Error('Merchant not found with merchant id.')
    }

    if (merchant.accessToken == null) {
        throw new Error('Access token not found on merchant.')
    }

    try {
        const resolveRefunndResponse = await refundSessionResolve(
            refundRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        )

        // If this were to throw, then we could just try again or add it to the retry queue, adding to the retry queue
        // works also because we would just make the same calls to shopify and because of idemoency, it would just
        // work. I also either need to validate the response here or just not return anything. The equivilent payment one
        // has to return so I should probably return for parity and have a validation function
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: 'paid',
        })
    } catch (error) {
        // TODO: Handle the error by adding it to the retry queue
    }
}

const validateDiscoveredPaymentTransaction = (
    transactionRecord: TransactionRecord,
    transaction: HeliusEnhancedTransaction
) => {
    transaction
    transactionRecord
}
