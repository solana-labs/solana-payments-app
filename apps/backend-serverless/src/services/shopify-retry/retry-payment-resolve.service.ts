import { ShopifyMutationPaymentResolve } from '../../models/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { PrismaClient, PaymentRecordStatus } from '@prisma/client';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { MissingExpectedDatabaseValueError } from '../../errors/missing-expected-database-value.error.js';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
import axios from 'axios';

export const retryPaymentResolve = async (
    paymentResolveInfo: ShopifyMutationPaymentResolve | null,
    prisma: PrismaClient
) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentResolveInfo == null) {
        throw new Error('Payment resolve info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentResolveInfo.paymentId });

    if (paymentRecord == null) {
        throw new MissingExpectedDatabaseRecordError('payment record');
    }

    if (paymentRecord.shopGid == null) {
        throw new MissingExpectedDatabaseValueError('payment record shop gid');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant == null) {
        throw new MissingExpectedDatabaseRecordError('merchant');
    }

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseValueError('merchant access token');
    }

    const paymentSessionResolve = makePaymentSessionResolve(axios);

    const resolvePaymentResponse = await paymentSessionResolve(
        paymentRecord.shopGid,
        merchant.shop,
        merchant.accessToken
    );

    // Update the payment record
    const nextAction = resolvePaymentResponse.data.paymentSessionResolve.paymentSession.nextAction;

    // This might be unnecessary, if this should always be present for success
    // then we should reflect that in the parsing and types
    if (nextAction == null) {
        throw new Error('Could not find next action.');
    }

    // TODO: Change these states to be more acturate for states of returning
    const action = nextAction.action;
    const nextActionContext = nextAction.context;

    if (nextActionContext == null) {
        throw new Error('Could not find next action context.');
    }

    const redirectUrl = nextActionContext.redirectUrl;

    try {
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: redirectUrl,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        // TODO: There is a theme of situations where i get valid calls back from shopify but then can't update my database
        // likely not common but i will want to handle these all the same
        throw new Error('Could not update payment record.');
    }
};
