import { ShopifyMutationRefundReject } from '../../models/sqs/shopify-mutation-retry.model.js';
import { MerchantService } from '../database/merchant-service.database.service.js';
import { RefundRecordService } from '../database/refund-record-service.database.service.js';
import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import { makeRefundSessionReject } from '../shopify/refund-session-reject.service.js';
import axios from 'axios';
import { validateRefundSessionRejected } from '../shopify/validate-refund-session-rejected.service.js';

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
        // TODO: Make sure this is how I want to update refunds in this situation
        await refundRecordService.updateRefundRecord(refundRecord, {
            status: RefundRecordStatus.rejected,
            completedAt: new Date(),
        });
    } catch {
        // Throw an error specifically about the database, might be able to handle this differently
        // TODO: There is a theme of situations where i get valid calls back from shopify but then can't update my database
        // likely not common but i will want to handle these all the same
        throw new Error('Could not update refund record.');
    }
};
