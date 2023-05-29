import { PrismaClient, RefundRecordStatus, TransactionRecord, TransactionType } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/helius-enhanced-transaction.model.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makeRefundSessionResolve } from '../shopify/refund-session-resolve.service.js';
import axios from 'axios';
import { verifyRefundTransactionWithRefundRecord } from '../transaction-validation/validate-discovered-refund-transaction.service.js';
import { web3 } from '@project-serum/anchor';
import { sendRefundResolveRetryMessage } from '../sqs/sqs-send-message.service.js';

// I'm not sure I love adding prisma into this but it should work for how we're handling testing now
export const processDiscoveredRefundTransaction = async (
    transactionRecord: TransactionRecord,
    transaction: web3.Transaction,
    prisma: PrismaClient
) => {
    // we should probably do some validation here to make sure the transaction
    // actually matches the refund record that the transaction is associated with
    // for now i will ignore that, mocked the function for now

    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    // Verify the transaction is a refund
    if (transactionRecord.type != TransactionType.refund) {
        throw new Error('Transaction record is not a refund');
    }

    // catching this error here and throwing will just give it back to /helius but then at least
    // that consolidates weird errors for logging into one place
    if (transactionRecord.refundRecordId == null) {
        throw new Error('Payment record not found on transaction record.');
    }

    const refundRecord = await refundRecordService.getRefundRecord({
        id: transactionRecord.refundRecordId,
    });

    if (refundRecord == null) {
        throw new Error('Refund record not found.');
    }

    if (refundRecord.shopGid == null) {
        throw new Error('Shop gid not found on refund record.');
    }

    if (refundRecord.merchantId == null) {
        throw new Error('Merchant ID not found on refund record.');
    }

    const merchant = await merchantService.getMerchant({
        id: refundRecord.merchantId,
    });

    if (merchant == null) {
        throw new Error('Merchant not found with merchant id.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Access token not found on merchant.');
    }

    // Verify against the refund record, if we throw in here, we should catch outside of this for logging
    verifyRefundTransactionWithRefundRecord(refundRecord, transaction, true);

    try {
        const refundSessionResolve = makeRefundSessionResolve(axios);
        const resolveRefundResponse = await refundSessionResolve(
            refundRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // TODO: Validate the response here

        // If this were to throw, then we could just try again or add it to the retry queue, adding to the retry queue
        // works also because we would just make the same calls to shopify and because of idemoency, it would just
        // work. I also either need to validate the response here or just not return anything. The equivilent payment one
        // has to return so I should probably return for parity and have a validation function
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.completed,
            transactionSignature: transactionRecord.signature,
            completedAt: new Date(),
        });
    } catch (error) {
        // TODO: Log the error with Sentry, generally could be a normal situation to arise but it's still good to try why it happened
        try {
            await sendRefundResolveRetryMessage(refundRecord.id);
        } catch (err) {
            // TODO: This would be an odd error to hit, sending messages to the queue shouldn't fail. It will be good to log this
            // with sentry and figure out why it happened. Also good to figure out some kind of redundancy here. Also good to
            // build in a way to manually intervene here if needed.
        }
    }
};
