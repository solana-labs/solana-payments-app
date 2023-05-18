import { PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { HeliusEnhancedTransaction } from '../../models/helius-enhanced-transaction.model.js';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { paymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
import { getCustomerFromHeliusEnhancedTransaction } from '../../utilities/get-customer.utility.js';
import { ResolvePaymentResponse } from '../../models/shopify-graphql-responses/resolve-payment-response.model.js';

// I'm not sure I love adding prisma into this but it should work for how we're handling testing now
export const processDiscoveredPaymentTransaction = async (
    transactionRecord: TransactionRecord,
    transaction: HeliusEnhancedTransaction,
    prisma: PrismaClient
) => {
    // we should probably do some validation here to make sure the transaction
    // actually matches the payment record that the transaction is associated with
    // for now i will ignore that, mocked the function for now
    validateDiscoveredPaymentTransaction(transactionRecord, transaction);

    const paymentRecordService = new PaymentRecordService(prisma);
    const merchantService = new MerchantService(prisma);

    // Verify the transaction is a payment
    if (transactionRecord.type != TransactionType.payment) {
        throw new Error('Transaction record is not a payment');
    }

    // catching this error here and throwing will just give it back to /helius but then at least
    // that consolidates weird errors for logging into one place
    if (transactionRecord.paymentRecordId == null) {
        throw new Error('Transaction record does not have a payment record id');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({
        id: transactionRecord.paymentRecordId,
    });

    if (paymentRecord == null) {
        throw new Error('Payment record not found.');
    }

    if (paymentRecord.shopGid == null) {
        throw new Error('Shop gid not found on payment record.');
    }

    if (paymentRecord.merchantId == null) {
        throw new Error('Merchant ID not found on payment record.');
    }

    const merchant = await merchantService.getMerchant({
        id: paymentRecord.merchantId,
    });

    if (merchant == null) {
        throw new Error('Merchant not found with merchant id.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Access token not found on merchant.');
    }

    // Ok so this part is interesting because if this were to throw, we would actully want different behavior
    // If we throw here, we want to retry this message later, but also, if it succeeds, and we check that the return
    // value fails, we also want to try again later, so basically we should either try/catch here and then
    // handle it here, or we can throw inside of paymentSessionResolve if it parses weird, and still handle it here,
    // either way, i'm thinking we want to handle it here
    try {
        const resolvePaymentResponse: ResolvePaymentResponse = await paymentSessionResolve(
            paymentRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // TODO: Do some parsing on this to validate that shopify recognized the update
        const redirectUrl =
            resolvePaymentResponse.data.paymentSessionResolve.paymentSession.nextAction.context.redirectUrl;

        if (redirectUrl == null) {
            throw new Error('Redirect url not found on payment session resolve response.');
        }

        // If this were to throw, then we could just try again or add it to the retry queue, adding to the retry queue
        // works also because we would just make the same calls to shopify and because of idemoency, it would just
        // work
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: 'completed',
            redirectUrl: redirectUrl,
            transactionSignature: transaction.signature,
        });
    } catch (error) {
        // TODO: Handle the error by adding it to the retry queue
    }
};

const validateDiscoveredPaymentTransaction = (
    transactionRecord: TransactionRecord,
    transaction: HeliusEnhancedTransaction
) => {
    transactionRecord;
    transaction;
};
