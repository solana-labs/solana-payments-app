import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import { ShopifyMutationRefundResolve } from '../../models/sqs/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { makeRefundSessionResolve } from '../shopify/refund-session-resolve.service.js';
import axios from 'axios';
import { validateRefundSessionResolved } from '../shopify/validate-refund-session-resolved.service.js';

export const retryRefundResolve = async (
    refundResolveInfo: ShopifyMutationRefundResolve | null,
    prisma: PrismaClient,
    axiosInstance: typeof axios
) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    if (refundResolveInfo == null) {
        throw new Error('Refund resolve info is null.');
    }

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundResolveInfo.refundId });

    if (refundRecord == null) {
        throw new Error('Could not find refund record.');
    }

    if (refundRecord.shopGid == null) {
        throw new Error('Could not find shop gid.');
    }

    const merchant = await merchantService.getMerchant({ id: refundRecord.merchantId });

    if (merchant == null) {
        throw new Error('Could not find merchant.');
    }

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const refundSessionResolve = makeRefundSessionResolve(axiosInstance);

    const resolveRefundResponse = await refundSessionResolve(refundRecord.shopGid, merchant.shop, merchant.accessToken);

    validateRefundSessionResolved(resolveRefundResponse);

    try {
        // TODO: Make sure this is how I want to update refunds in this situation
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.completed,
            completedAt: new Date(),
        });
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        // TODO: There is a theme of situations where i get valid calls back from shopify but then can't update my database
        // likely not common but i will want to handle these all the same
        throw new Error('Could not update refund record.');
    }
};
