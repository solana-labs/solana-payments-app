import { MerchantAuthToken } from '../../../models/clients/merchant-ui/merchant-auth-token.model.js';
import { PrismaClient } from '@prisma/client';
import { Pagination } from './database-services.utility.js';
import { PaymentDataResponse, createPaymentDataResponseFromPaymentRecord } from './payment-record.utility.js';
import { PaymentRecordService } from '../../../services/database/payment-record-service.database.service.js';

export interface PaymentResponse {
    page: number;
    pageSize: number;
    total: number;
    data: PaymentDataResponse[];
}

export const createPaymentResponse = async (
    merchantAuthToken: MerchantAuthToken,
    pagination: Pagination,
    prisma: PrismaClient
): Promise<PaymentResponse> => {
    const paymentRecordService = new PaymentRecordService(prisma);
    const paymentsRecords = await paymentRecordService.getPaymentRecordsForMerchantWithPagination(
        { merchantId: merchantAuthToken.id },
        pagination
    );

    if (paymentsRecords == null || paymentsRecords.length == 0) {
        return {
            page: 1,
            pageSize: pagination.pageSize,
            total: 0,
            data: [],
        };
    }

    const total =
        (await paymentRecordService.getTotalPaymentRecordsForMerchant({
            merchantId: merchantAuthToken.id,
        })) ?? 0;

    const paymentRecordResponseData = paymentsRecords.map(paymentRecord => {
        return createPaymentDataResponseFromPaymentRecord(paymentRecord);
    });

    return {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: total,
        data: paymentRecordResponseData,
    };
};
