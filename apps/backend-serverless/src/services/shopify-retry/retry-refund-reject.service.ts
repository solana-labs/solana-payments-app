import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import axios from 'axios';
import { ShopifyMutationRefundReject } from '../../models/sqs/shopify-mutation-retry.model';
import { MerchantService } from '../database/merchant-service.database.service';
import { RefundRecordService } from '../database/refund-record-service.database.service';
import { makeRefundSessionReject } from '../shopify/refund-session-reject.service';
import { validateRefundSessionRejected } from '../shopify/validate-refund-session-rejected.service';

export const retryRefundReject = async (
    refundRejectInfo: ShopifyMutationRefundReject | null,
    prisma: PrismaClient,
    axiosInstance: typeof axios
) => {
    const merchantService = new MerchantService(prisma);
    const refundRecordService = new RefundRecordService(prisma);

    if (refundRejectInfo == null) {
        throw new Error('Refund reject info is null.');
    }

    const refundRecord = await refundRecordService.getRefundRecord({ id: refundRejectInfo.refundId });

    if (refundRecord.shopGid == null) {
        throw new Error('Could not find shop gid.');
    }

    const merchant = await merchantService.getMerchant({ id: refundRecord.merchantId });

    if (merchant.accessToken == null) {
        throw new Error('Could not find access token.');
    }

    const refundSessionReject = makeRefundSessionReject(axiosInstance);

    const rejectRefundResponse = await refundSessionReject(
        refundRecord.shopGid,
        refundRejectInfo.code,
        refundRejectInfo.merchantMessage,
        merchant.shop,
        merchant.accessToken
    );

    validateRefundSessionRejected(rejectRefundResponse);

    try {
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.rejected,
            completedAt: new Date(),
        });
    } catch (error) {
        // CRITICAL: Add to critical message queue
        // We should be logging to sentry underneath so we don't need to here
        throw error;
    }
};
