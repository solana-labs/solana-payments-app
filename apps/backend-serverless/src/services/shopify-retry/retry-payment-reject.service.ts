import { ShopifyMutationPaymentReject } from '../../models/shopify-mutation-retry.model.js';
import { PrismaClient, PaymentRecordStatus } from '@prisma/client';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { PaymentRecordService } from '../database/payment-record-service.database.service.js';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { MissingExpectedDatabaseValueError } from '../../errors/missing-expected-database-value.error.js';
import { makePaymentSessionReject } from '../shopify/payment-session-reject.service.js';
import axios from 'axios';

export const retryPaymentReject = async (
    paymentRejectInfo: ShopifyMutationPaymentReject | null,
    prisma: PrismaClient
) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentRejectInfo == null) {
        throw new Error('Payment reject info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentRejectInfo.paymentId });

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

    const paymentSessionReject = makePaymentSessionReject(axios);

    const rejectPaymentResponse = await paymentSessionReject(
        paymentRecord.shopGid,
        paymentRejectInfo.reason,
        merchant.shop,
        merchant.accessToken
    );

    try {
        // TODO: We havne't implemented rejected payments yet, need to get this working then when i handle all of that
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.rejected,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        // TODO: There is a theme of situations where i get valid calls back from shopify but then can't update my database
        // likely not common but i will want to handle these all the same
        throw new Error('Could not update payment record.');
    }
};
