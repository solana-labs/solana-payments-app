import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import { ShopifyMutationRefundResolve } from '../../models/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { makeRefundSessionResolve } from '../shopify/refund-session-resolve.service.js';
import axios from 'axios';

export const retryRefundResolve = async (
    refundResolveInfo: ShopifyMutationRefundResolve | null,
    prisma: PrismaClient
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

    const refundSessionResolve = makeRefundSessionResolve(axios);

    try {
        const resolveRefundResponse = await refundSessionResolve(
            refundRecord.shopGid,
            merchant.shop,
            merchant.accessToken
        );

        // Validate the response

        // TODO: Make sure this is how I want to update refunds in this situation
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.completed,
            completedAt: new Date(),
        });
    } catch (error) {
        // Throw an error specifically about the database, might be able to handle this differently
        throw new Error('Could not update refund record.');
    }
};
