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

    // Verify against the payment record, if we throw in here, we should catch outside of this for logging
    verifyPaymentTransactionWithPaymentRecord(paymentRecord, transaction, true);

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

        // If this were to throw, then we could just try again or add it to the retry queue, adding to the retry queue
        // works also because we would just make the same calls to shopify and because of idemoency, it would just
        // work
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: redirectUrl,
            transactionSignature: transactionRecord.signature,
            completedAt: new Date(),
        });
    } catch (error) {
        // TODO: Handle the error by adding it to the retry queue
    }
};
