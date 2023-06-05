import { PaymentRecordStatus, PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/dependencies/helius-enhanced-transaction.model.js';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
import axios from 'axios';
import {
    verifyPaymentRecordWithHeliusEnhancedTransaction,
    verifyPaymentTransactionWithPaymentRecord,
} from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import { web3 } from '@project-serum/anchor';
import { sendPaymentResolveRetryMessage } from '../sqs/sqs-send-message.service.js';
import { validatePaymentSessionResolved } from '../shopify/validate-payment-session-resolved.service.js';
import * as Sentry from '@sentry/serverless';
import { fetchTransaction } from '../fetch-transaction.service.js';
import { delay } from '../../utilities/delay.utility.js';

export const processDiscoveredPaymentTransaction = async (
    transactionRecord: TransactionRecord,
    transaction: HeliusEnhancedTransaction,
    prisma: PrismaClient
) => {
    const paymentRecordService = new PaymentRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    if (transactionRecord.type != TransactionType.payment) {
        // This would be a silly error to hit but it guards against incorrect usage
        // All calls of this method should check it is a payment before calling
        Sentry.captureException(new Error('Transaction record is not a payment'));
        throw new Error('Transaction record is not a payment');
    }

    if (transactionRecord.paymentRecordId == null) {
        // This would another silly error to hit but would reveal a greater problem
        // All transaction records with a type of payment should have a payment record id
        Sentry.captureException(new Error('Transaction record is not a payment'));
        throw new Error('Transaction record does not have a payment record id');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({
        id: transactionRecord.paymentRecordId,
    });

    if (paymentRecord == null) {
        // This case shouldn't come up because right now we don't have a strategy for pruning
        // records from the database. So if the transaction record refrences a payment record
        // but we can't find that payment record, then we have a problem with our database or
        // how we created this transaction record.\
        Sentry.captureException(new Error('Payment record not found'));
        throw new Error('Payment record not found.');
    }

    if (paymentRecord.merchantId == null) {
        // Another case that shouldn't happen. This could mean that a payment record got updated to remove
        // a merchant id or that we created a transaction record without a merchant id.
        Sentry.captureException(new Error('Merchant ID not found on payment record'));
        throw new Error('Merchant ID not found on payment record.');
    }

    if (paymentRecord.shopGid == null) {
        // Another case that shouldn't happen. This could mean that a payment record got updated to remove
        // a shop gid or that we created a transaction record without a shop gid.
        Sentry.captureException(new Error('Shop gid not found on payment record'));
        throw new Error('Shop gid not found on payment record.');
    }

    const merchant = await merchantService.getMerchant({
        id: paymentRecord.merchantId,
    });

    if (merchant == null) {
        // Another situation that shouldn't happen but could if a merchant deletes our app and we try to
        // process some kind of transaction after they're deleted
        // TODO: Figure out what happens if a merchant deletes our app but then a customer wants a refund
        Sentry.captureException(new Error('Merchant not found with merchant id'));
        throw new Error('Merchant not found with merchant id.');
    }

    if (merchant.accessToken == null) {
        // This isn't likely as we shouldn't be gettings calls to create payments for merchants without
        // access tokens. A more likely situation is that the access token is invalid. This could mean
        // that the access token was deleted for some reason which would be a bug.
        Sentry.captureException(new Error('Merchant not found with merchant id'));
        throw new Error('Access token not found on merchant.');
    }

    verifyPaymentRecordWithHeliusEnhancedTransaction(paymentRecord, transaction, true); // TODO: Uncomment this

    let rpcTransaction: web3.Transaction | null = null;

    while (rpcTransaction == null) {
        try {
            await delay(3000);
            rpcTransaction = await fetchTransaction(transactionRecord.signature);
        } catch (error) {}
    }

    // Verify against the payment record, if we throw in here, we should catch outside of this for logging
    verifyPaymentTransactionWithPaymentRecord(paymentRecord, rpcTransaction, true); // TODO: Uncomment this

    // -- if we get here, we found a match! --
    // we would hope at this point we could update the database to reflect we found it's match
    // need to make sure we can guarentee that this can always go back and fix itself
    // TODO: Figure out strategy for retrying this if it fails, I think cron job will suffice but
    // let's be sure. No state should have changed so cron job should cover us.
    // TODO, update can fail so add try/catch here
    await paymentRecordService.updatePaymentRecord(paymentRecord, {
        status: PaymentRecordStatus.paid,
        transactionSignature: transactionRecord.signature,
    });

    try {
        const paymentSessionResolve = makePaymentSessionResolve(axios);

        const resolvePaymentResponse = await paymentSessionResolve(
            paymentRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        const resolvePaymentData = validatePaymentSessionResolved(resolvePaymentResponse);

        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: resolvePaymentData.redirectUrl,
            completedAt: new Date(),
        });
    } catch (error) {
        // TODO: Log the error with Sentry, generally could be a normal situation to arise but it's still good to try why it happened
        Sentry.captureException(error);
        try {
            await sendPaymentResolveRetryMessage(paymentRecord.id);
        } catch (err) {
            // TODO: This would be an odd error to hit, sending messages to the queue shouldn't fail. It will be good to log this
            // with sentry and figure out why it happened. Also good to figure out some kind of redundancy here. Also good to
            // build in a way to manually intervene here if needed.
        }
    }
};
