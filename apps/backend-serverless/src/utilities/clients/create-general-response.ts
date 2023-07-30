import { PrismaClient } from '@prisma/client';
import { MerchantAuthToken } from '../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { RefundRecordService } from '../../services/database/refund-record-service.database.service.js';

export interface GeneralResponse {
    refundBadges: number | null;
}

export const createGeneralResponse = async (
    merchantAuthToken: MerchantAuthToken,
    prisma: PrismaClient
): Promise<GeneralResponse> => {
    const refundRecordService = new RefundRecordService(prisma);
    const total = await refundRecordService.getTotalOpenRefundRecordsForMerchant({
        merchantId: merchantAuthToken.id,
    });
    return {
        refundBadges: total,
    };
};
