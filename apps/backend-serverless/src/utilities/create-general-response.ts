import { MerchantAuthToken } from '../models/clients/merchant-ui/merchant-auth-token.model.js';
import { RefundRecordService } from '../services/database/refund-record-service.database.service.js';
import { PrismaClient, RefundRecordStatus } from '@prisma/client';

export interface GeneralResponse {
    refundBadges: number | null;
}

export const createGeneralResponse = async (
    merchantAuthToken: MerchantAuthToken,
    prisma: PrismaClient
): Promise<GeneralResponse> => {
    const refundRecordService = new RefundRecordService(prisma);
    const total = await refundRecordService.getTotalRefundRecordsForMerchant({
        merchantId: merchantAuthToken.id,
        status: RefundRecordStatus.pending,
    });
    return {
        refundBadges: total,
    };
};
