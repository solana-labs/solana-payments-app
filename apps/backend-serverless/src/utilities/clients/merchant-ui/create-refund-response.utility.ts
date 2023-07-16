import { PaymentRecord, PrismaClient, RefundRecord } from '@prisma/client';
import { MerchantAuthToken } from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { RefundRecordService } from '../../../services/database/refund-record-service.database.service.js';
import { Pagination } from './database-services.utility.js';
import { RefundDataResponse, createRefundDataResponseFromRefundRecord } from './refund-record.utility.js';

export interface RefundResponse {
    page: number;
    pageSize: number;
    total: number;
    data: RefundDataResponse[];
}

export enum RefundStatusOption {
    open = 'open',
    closed = 'closed',
}

export const createRefundResponse = async (
    merchantAuthToken: MerchantAuthToken,
    status: RefundStatusOption,
    pagination: Pagination,
    prisma: PrismaClient,
): Promise<RefundResponse> => {
    const refundRecordService = new RefundRecordService(prisma);
    let refundRecords: (RefundRecord & { paymentRecord: PaymentRecord | null })[] | null;
    let total: number;

    if (status == RefundStatusOption.open) {
        refundRecords = await refundRecordService.getOpenRefundRecordsForMerchantWithPagination(
            { merchantId: merchantAuthToken.id },
            pagination,
        );
        total =
            (await refundRecordService.getTotalOpenRefundRecordsForMerchant({
                merchantId: merchantAuthToken.id,
            })) ?? 0;
    } else {
        refundRecords = await refundRecordService.getClosedRefundRecordsForMerchantWithPagination(
            { merchantId: merchantAuthToken.id },
            pagination,
        );
        total =
            (await refundRecordService.getTotalClosedRefundRecordsForMerchant({
                merchantId: merchantAuthToken.id,
            })) ?? 0;
    }

    if (refundRecords == null || refundRecords.length == 0) {
        return {
            page: 1,
            pageSize: pagination.pageSize,
            total: 0,
            data: [],
        };
    }

    const refundRecordResponseData = refundRecords.map(refundRecord => {
        return createRefundDataResponseFromRefundRecord(refundRecord);
    });

    return {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: total,
        data: refundRecordResponseData,
    };
};
