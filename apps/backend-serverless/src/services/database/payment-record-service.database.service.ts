import {
    PrismaClient,
    PaymentRecord,
    Merchant,
    PaymentRecordStatus,
    PaymentRecordRejectionReason,
} from '@prisma/client';
import { ShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model.js';
import { Pagination, calculatePaginationSkip } from '../../utilities/database-services.utility.js';

export type PaidUpdate = {
    status: PaymentRecordStatus;
    transactionSignature: string;
};

export type TransactionSignatureUpdate = {
    transactionSignature: string;
};

export type StatusRedirectTransactionUpdate = {
    status: PaymentRecordStatus;
    redirectUrl: string;
    completedAt: Date;
};

export type StatusRedirectRejectionUpdate = {
    status: PaymentRecordStatus;
    redirectUrl: string;
    completedAt: Date;
    rejectionReason: PaymentRecordRejectionReason;
};

export type StatusCompletedUpdate = {
    status: PaymentRecordStatus;
    completedAt: Date;
};

export type PaymentRecordUpdate =
    | PaidUpdate
    | TransactionSignatureUpdate
    | StatusRedirectTransactionUpdate
    | StatusCompletedUpdate
    | StatusRedirectRejectionUpdate;

export type ShopIdQuery = {
    shopId: string;
};

// TODO: Better name for this type
export type IdQuery = {
    id: string;
};

export type MerchantIdQuery = {
    merchantId: string;
};

export type PaymentRecordQuery = ShopIdQuery | IdQuery | MerchantIdQuery;

export class PaymentRecordService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getPaymentRecord(query: PaymentRecordQuery): Promise<PaymentRecord | null> {
        return await this.prisma.paymentRecord.findFirst({
            where: query,
        });
    }

    async getPaymentRecordsForMerchantWithPagination(
        query: PaymentRecordQuery,
        pagination: Pagination
    ): Promise<PaymentRecord[] | null> {
        return await this.prisma.paymentRecord.findMany({
            where: query,
            take: pagination.pageSize,
            skip: calculatePaginationSkip(pagination),
        });
    }

    async getTotalPaymentRecordsForMerchant(query: PaymentRecordQuery): Promise<number> {
        return await this.prisma.paymentRecord.count({
            where: query,
        });
    }

    async createPaymentRecord(
        id: string,
        paymentInitiation: ShopifyPaymentInitiation,
        merchant: Merchant,
        usdcAmount: number
    ): Promise<PaymentRecord> {
        try {
            return await this.prisma.paymentRecord.create({
                data: {
                    id: id,
                    status: PaymentRecordStatus.pending,
                    shopId: paymentInitiation.id,
                    shopGid: paymentInitiation.gid,
                    shopGroup: paymentInitiation.group,
                    test: paymentInitiation.test,
                    amount: paymentInitiation.amount,
                    currency: paymentInitiation.currency,
                    merchantId: merchant.id,
                    cancelURL: paymentInitiation.payment_method.data.cancel_url,
                    transactionSignature: null,
                    usdcAmount: usdcAmount,
                    requestedAt: new Date(),
                    completedAt: null,
                    rejectionReason: null,
                },
            });
        } catch {
            throw new Error('Failed to create payment record.');
        }
    }

    async updatePaymentRecord(paymentRecord: PaymentRecord, update: PaymentRecordUpdate): Promise<PaymentRecord> {
        try {
            return await this.prisma.paymentRecord.update({
                where: {
                    id: paymentRecord.id,
                },
                data: update,
            });
        } catch {
            throw new Error('Failed to update payment record.');
        }
    }
}
