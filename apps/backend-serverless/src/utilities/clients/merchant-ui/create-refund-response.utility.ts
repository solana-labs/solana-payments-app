import { MerchantAuthToken } from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { RefundRecordService } from '../../../services/database/refund-record-service.database.service.js';
import { PrismaClient, RefundRecordStatus } from '@prisma/client';
import { Pagination } from './database-services.utility.js';
import { ref } from 'yup';
import { RefundDataResponse, createRefundDataResponseFromRefundRecord } from './refund-record.utility.js';

export interface RefundResponse {
    page: number;
    pageSize: number;
    total: number;
    data: RefundDataResponse[];
}

export const createRefundResponse = async (
    merchantAuthToken: MerchantAuthToken,
    status: RefundRecordStatus,
    pagination: Pagination,
    prisma: PrismaClient
): Promise<RefundResponse> => {
    const refundRecordService = new RefundRecordService(prisma);
    const refundRecords = await refundRecordService.getRefundRecordsForMerchantWithPagination(
        { merchantId: merchantAuthToken.id, status: status },
        pagination
    );

    if (refundRecords == null || refundRecords.length == 0) {
        return {
            page: 1,
            pageSize: pagination.pageSize,
            total: 0,
            data: [],
        };
    }

    const total =
        (await refundRecordService.getTotalRefundRecordsForMerchant({
            merchantId: merchantAuthToken.id,
            status: status,
        })) ?? 0;

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
