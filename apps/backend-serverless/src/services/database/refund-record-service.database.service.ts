import {
    PrismaClient,
    Merchant,
    RefundRecord,
    PaymentRecord,
    PaymentRecordStatus,
    RefundRecordStatus,
} from '@prisma/client';
import { ShopifyRefundInitiation } from '../../models/process-refund.request.model.js';
import { Pagination, calculatePaginationSkip } from '../../utilities/database-services.utility.js';

export type PaidUpdate = {
    status: PaymentRecordStatus;
};

export type StatusTransactionUpdate = {
    status: PaymentRecordStatus;
    transactionSignature: string;
    completedAt: Date;
};

export type RefundRecordUpdate = PaidUpdate | StatusTransactionUpdate;

export type ShopIdQuery = {
    shopId: string;
};

export type RefundIdQuery = {
    id: string;
};

export type RefundIdMerchantIdQuery = {
    id: string;
    merchantId: string;
};

export type MerchantIdQuery = {
    merchantId: string;
};

export type MerchantAndStatusQuery = {
    merchantId: string;
    status: PaymentRecordStatus;
};

export type RefundRecordQuery =
    | ShopIdQuery
    | RefundIdQuery
    | MerchantIdQuery
    | MerchantAndStatusQuery
    | RefundIdMerchantIdQuery;

// --- RefundRecordService CRUD Operations ---
// 1. getRefundRecord
// 2. createRefundRecord
// 3. updateRefundRecord
export class RefundRecordService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getRefundRecord(query: RefundRecordQuery): Promise<RefundRecord | null> {
        return await this.prisma.refundRecord.findFirst({
            where: query,
        });
    }

    async getRefundRecordWithPayment(
        query: RefundRecordQuery
    ): Promise<(RefundRecord & { paymentRecord: PaymentRecord | null }) | null> {
        return await this.prisma.refundRecord.findFirst({
            where: query,
            include: {
                paymentRecord: true,
            },
        });
    }

    async getRefundRecordsForMerchantWithPagination(
        query: RefundRecordQuery,
        pagination: Pagination
    ): Promise<(RefundRecord & { paymentRecord: PaymentRecord | null })[] | null> {
        return await this.prisma.refundRecord.findMany({
            where: query,
            include: {
                paymentRecord: true,
            },
            take: pagination.pageSize,
            skip: pagination.pageSize * (pagination.page - 1),
        });
    }

    async getTotalRefundRecordsForMerchant(query: RefundRecordQuery): Promise<number | null> {
        return await this.prisma.refundRecord.count({
            where: query,
        });
    }

    async createRefundRecord(
        id: string,
        refundInitiation: ShopifyRefundInitiation,
        merchant: Merchant,
        usdcAmount: number
    ): Promise<RefundRecord> {
        try {
            return await this.prisma.refundRecord.create({
                data: {
                    id: id,
                    status: RefundRecordStatus.pending,
                    amount: refundInitiation.amount,
                    currency: refundInitiation.currency,
                    usdcAmount: usdcAmount,
                    shopId: refundInitiation.id,
                    shopGid: refundInitiation.gid,
                    shopPaymentId: refundInitiation.payment_id,
                    test: refundInitiation.test,
                    merchantId: merchant.id,
                    transactionSignature: null,
                    requestedAt: new Date(),
                    completedAt: null,
                },
            });
        } catch {
            throw new Error('Failed to create refund record.');
        }
    }

    async updateRefundRecord(refundRecord: RefundRecord, update: RefundRecordUpdate): Promise<RefundRecord> {
        try {
            return await this.prisma.refundRecord.update({
                where: {
                    id: refundRecord.id,
                },
                data: update,
            });
        } catch {
            throw new Error('Failed to update refund record.');
        }
    }
}
