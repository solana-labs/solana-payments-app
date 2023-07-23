import { PaymentRecordStatus, PrismaClient } from '@prisma/client';
import axios from 'axios';
import { MissingExpectedDatabaseValueError } from '../../errors/missing-expected-database-value.error';
import { ShopifyMutationPaymentResolve } from '../../models/sqs/shopify-mutation-retry.model';
import { MerchantService } from '../database/merchant-service.database.service';
import { PaymentRecordService } from '../database/payment-record-service.database.service';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service';
import { validatePaymentSessionResolved } from '../shopify/validate-payment-session-resolved.service';

export const retryPaymentResolve = async (
    paymentResolveInfo: ShopifyMutationPaymentResolve | null,
    prisma: PrismaClient,
    axiosInstance: typeof axios
) => {
    const merchantService = new MerchantService(prisma);
    const paymentRecordService = new PaymentRecordService(prisma);

    if (paymentResolveInfo == null) {
        throw new Error('Payment resolve info is null.');
    }

    const paymentRecord = await paymentRecordService.getPaymentRecord({ id: paymentResolveInfo.paymentId });

    if (paymentRecord.shopGid == null) {
        throw new MissingExpectedDatabaseValueError('payment record shop gid');
    }

    const merchant = await merchantService.getMerchant({ id: paymentRecord.merchantId });

    if (merchant.accessToken == null) {
        throw new MissingExpectedDatabaseValueError('merchant access token');
    }

    const paymentSessionResolve = makePaymentSessionResolve(axiosInstance);

    const resolvePaymentResponse = await paymentSessionResolve(
        paymentRecord.shopGid,
        merchant.shop,
        merchant.accessToken
    );

    const resolvePaymentData = validatePaymentSessionResolved(resolvePaymentResponse);

    try {
        await paymentRecordService.updatePaymentRecord(paymentRecord, {
            status: PaymentRecordStatus.completed,
            redirectUrl: resolvePaymentData.redirectUrl,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        // TODO: There is a theme of situations where i get valid calls back from shopify but then can't update my database
        // likely not common but i will want to handle these all the same
        throw new Error('Could not update payment record.');
    }
};
