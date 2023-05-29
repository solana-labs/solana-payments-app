import { PaymentRecordStatus, PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/helius-enhanced-transaction.model.js';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { getCustomerFromHeliusEnhancedTransaction } from '../../utilities/get-customer.utility.js';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
import axios from 'axios';
import { verifyPaymentTransactionWithPaymentRecord } from '../transaction-validation/validate-discovered-payment-transaction.service.js';
import { web3 } from '@project-serum/anchor';

export const processDiscoveredPaymentTransaction = async (
    transactionRecord: TransactionRecord,
    transaction: web3.Transaction,
    prisma: PrismaClient
) => {
    const paymentRecordService = new PaymentRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    if (transactionRecord.type != TransactionType.payment) {
        // This would be a silly error to hit but it guards against incorrect usage
        // All calls of this method should check it is a payment before calling
        throw new Error('Transaction record is not a payment');
    }

    if (transactionRecord.paymentRecordId == null) {
        // This would another silly error to hit but would reveal a greater problem
        // All transaction records with a type of payment should have a payment record id
        throw new Error('Transaction record does not have a payment record id');
    }

    let paymentRecord = await paymentRecordService.getPaymentRecord({
        id: transactionRecord.paymentRecordId,
    });

    if (paymentRecord == null) {
        // This case shouldn't come up because right now we don't have a strategy for pruning
        // records from the database. So if the transaction record refrences a payment record
        // but we can't find that payment record, then we have a problem with our database or
        // how we created this transaction record.
        throw new Error('Payment record not found.');
    }

    if (paymentRecord.merchantId == null) {
        // Another case that shouldn't happen. This could mean that a payment record got updated to remove
        // a merchant id or that we created a transaction record without a merchant id.
        throw new Error('Merchant ID not found on payment record.');
    }

    const merchant = await merchantService.getMerchant({
        id: paymentRecord.merchantId,
    });

    if (merchant == null) {
        // Another situation that shouldn't happen but could if a merchant deletes our app and we try to
        // process some kind of transaction after they're deleted
        // TODO: Figure out what happens if a merchant deletes our app but then a customer wants a refund
        throw new Error('Merchant not found with merchant id.');
    }

    if (merchant.accessToken == null) {
        // This isn't likely as we shouldn't be gettings calls to create payments for merchants without
        // access tokens. A more likely situation is that the access token is invalid. This could mean
        // that the access token was deleted for some reason which would be a bug.
        throw new Error('Access token not found on merchant.');
    }

    // Verify against the payment record, if we throw in here, we should catch outside of this for logging
    verifyPaymentTransactionWithPaymentRecord(paymentRecord, transaction, true);

    // -- if we get here, we found a match! --
    // we would hope at this point we could update the database to reflect we found it's match
    // need to make sure we can guarentee that this can always go back and fix itself
    // TODO: Figure out strategy for retrying this if it fails, I think cron job will suffice but
    // let's be sure. No state should have changed so cron job should cover us.
    paymentRecord = await paymentRecordService.updatePaymentRecord(paymentRecord, {
        status: PaymentRecordStatus.paid,
        transactionSignature: transactionRecord.signature,
    });

    if (paymentRecord.shopGid == null) {
        // This is a simple check that we have already done above here, but after updating the payment
        // record, we'd like to repeat this as we need the value for a call below. If this were to throw
        // then we should be certain it would get recovered. I'm not sure though how that would happen
        // without the shopGid.
        throw new Error('Shop gid not found on payment record.');
    }

    // Ok so this part is interesting because if this were to throw, we would actully want different behavior
    // If we throw here, we want to retry this message later, but also, if it succeeds, and we check that the return
    // value fails, we also want to try again later, so basically we should either try/catch here and then
    // handle it here, or we can throw inside of paymentSessionResolve if it parses weird, and still handle it here,
    // either way, i'm thinking we want to handle it here
    try {
        const paymentSessionResolve = makePaymentSessionResolve(axios);

        const resolvePaymentResponse = await paymentSessionResolve(
            paymentRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // TODO: Do some parsing on this to validate that shopify recognized the update
        const paymentSession = resolvePaymentResponse.data.paymentSessionResolve.paymentSession;
        const redirectUrl = paymentSession.nextAction?.context?.redirectUrl;

        if (redirectUrl == null) {
            throw new Error('Redirect url not found on payment session resolve response.');
        }

        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: redirectUrl,
            completedAt: new Date(),
        });
    } catch (error) {
        /**
         * Only the follow situations should have gotten us here
         * 1. Error making the call to shopify, this is good because this is a place for us to add
         * to the retry queue.
         * 2. A bad response from Shopify, again, this is probably good given their idempotency. We
         * should eventually get a valid response.
         * 3. A bad update to our database. Again, with Shopify being idempotent, we should be able to
         * make the same call later and get a valid response. Then the data should be there and we should be able
         * to make the call to the database. The error however would be odd.
         *
         * Thought, what happens if the retry queue fails? I mean ffs how many things can fail at the same time?
         * Can't I just trust a single dependency?
         */
    }
};
