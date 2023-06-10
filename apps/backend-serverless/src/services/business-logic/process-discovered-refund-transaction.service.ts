import { PrismaClient, RefundRecord, RefundRecordStatus, TransactionRecord, TransactionType } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makeRefundSessionResolve } from '../shopify/refund-session-resolve.service.js';
import axios from 'axios';
import {
    verifyRefundRecordWithHeliusEnhancedTransaction,
    verifyRefundTransactionWithRefundRecord,
} from '../transaction-validation/validate-discovered-refund-transaction.service.js';
import * as web3 from '@solana/web3.js';
import { sendRefundResolveRetryMessage } from '../sqs/sqs-send-message.service.js';
import { validateRefundSessionResolved } from '../shopify/validate-refund-session-resolved.service.js';
import { delay } from '../../utilities/delay.utility.js';
import { fetchTransaction } from '../fetch-transaction.service.js';

// I'm not sure I love adding prisma into this but it should work for how we're handling testing now
export const processDiscoveredRefundTransaction = async (
    refundRecord: RefundRecord,
    transaction: HeliusEnhancedTransaction,
    prisma: PrismaClient
) => {
    // we should probably do some validation here to make sure the transaction
    // actually matches the refund record that the transaction is associated with
    // for now i will ignore that, mocked the function for now

    const refundRecordService = new RefundRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    const merchant = await merchantService.getMerchant({
        id: refundRecord.merchantId,
    });

    if (merchant == null) {
        throw new Error('Merchant not found with merchant id.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Access token not found on merchant.');
    }

    verifyRefundRecordWithHeliusEnhancedTransaction(refundRecord, transaction, true);

    let rpcTransaction: web3.Transaction | null = null;

    while (rpcTransaction == null) {
        try {
            await delay(3000);
            rpcTransaction = await fetchTransaction(transaction.signature);
        } catch (error) {}
    }

    // Verify against the refund record, if we throw in here, we should catch outside of this for logging
    verifyRefundTransactionWithRefundRecord(refundRecord, rpcTransaction, true);

    // TODO: Try catch this and handle cases where database updates fail
    refundRecordService.updateRefundRecord(refundRecord, {
        status: RefundRecordStatus.paid,
        transactionSignature: transaction.signature,
    });

    try {
        const refundSessionResolve = makeRefundSessionResolve(axios);

        const resolveRefundResponse = await refundSessionResolve(
            refundRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        validateRefundSessionResolved(resolveRefundResponse);

        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.completed,
            transactionSignature: transaction.signature,
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
