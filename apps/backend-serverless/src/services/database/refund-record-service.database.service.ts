import {
    PrismaClient,
    Merchant,
    RefundRecord,
    PaymentRecord,
    PaymentRecordStatus,
    RefundRecordStatus,
    TransactionRecord,
} from '@prisma/client';
import { ShopifyRefundInitiation } from '../../models/shopify/process-refund.request.model.js';
import { Pagination, calculatePaginationSkip } from '../../utilities/clients/merchant-ui/database-services.utility.js';
import { prismaErrorHandler } from './shared.database.service.js';
import { RecordService, RefundResolveResponse } from './record-service.database.service.js';
import axios from 'axios';
import { MerchantService } from './merchant-service.database.service.js';
import { makeRefundSessionResolve } from '../shopify/refund-session-resolve.service.js';
import { validateRefundSessionResolved } from '../shopify/validate-refund-session-resolved.service.js';
import { sendRefundResolveRetryMessage } from '../sqs/sqs-send-message.service.js';

export type PaidTransactionUpdate = {
    status: PaymentRecordStatus;
    transactionSignature: string;
};

export type PaidUpdate = {
    status: PaymentRecordStatus;
};

export type StatusTransactionUpdate = {
    status: PaymentRecordStatus;
    transactionSignature: string;
    completedAt: Date;
};

export type RefundRecordUpdate = PaidUpdate | StatusTransactionUpdate | PaidTransactionUpdate;

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

export class RefundRecordService implements RecordService<RefundRecord, RefundResolveResponse> {
    private prisma: PrismaClient;
    private merchantService: MerchantService;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
        this.merchantService = new MerchantService(prismaClient);
    }

    async getRecord(transactionRecord: TransactionRecord): Promise<RefundRecord | null> {
        if (transactionRecord.refundRecordId == null) {
            throw new Error('Transaction record does not have a refund record id');
        }

        return prismaErrorHandler(
            this.prisma.refundRecord.findFirst({
                where: {
                    id: transactionRecord.refundRecordId,
                },
            })
        );
    }

    async updateRecordToPaid(recordId: string, transactionSignature: string): Promise<RefundRecord> {
        return await prismaErrorHandler(
            this.prisma.refundRecord.update({
                where: {
                    id: recordId,
                },
                data: {
                    status: PaymentRecordStatus.paid,
                    transactionSignature: transactionSignature,
                    completedAt: new Date(),
                },
            })
        );
    }

    async updateRecordToCompleted(recordId: string, redirectUrl: string): Promise<RefundRecord> {
        return await prismaErrorHandler(
            this.prisma.refundRecord.update({
                where: {
                    id: recordId,
                },
                data: {
                    status: RefundRecordStatus.completed,
                    completedAt: new Date(),
                },
            })
        );
    }

    async resolveSession(record: RefundRecord, axiosInstance: typeof axios): Promise<RefundResolveResponse> {
        const merchant = await this.merchantService.getMerchant({ id: record.merchantId });

        if (merchant == null) {
            throw new Error('Merchant not found');
        }

        if (merchant.accessToken == null) {
            throw new Error('Merchant access token not found');
        }

        const refundSessionResolve = makeRefundSessionResolve(axiosInstance);

        const resolveRefundResponse = await refundSessionResolve(record.shopGid, merchant.shop, merchant.accessToken);

        validateRefundSessionResolved(resolveRefundResponse);

        return {};
    }

    async sendResolveRetry(record: RefundRecord) {
        await sendRefundResolveRetryMessage(record.id);
    }

    async getRefundRecord(query: RefundRecordQuery): Promise<RefundRecord | null> {
        return prismaErrorHandler(
            this.prisma.refundRecord.findFirst({
                where: query,
            })
        );
    }

    async getRefundRecordWithPayment(
        query: RefundRecordQuery
    ): Promise<(RefundRecord & { paymentRecord: PaymentRecord | null }) | null> {
        return prismaErrorHandler(
            this.prisma.refundRecord.findFirst({
                where: query,
                include: {
                    paymentRecord: true,
                },
            })
        );
    }

    async getOpenRefundRecordsForMerchantWithPagination(
        query: RefundRecordQuery,
        pagination: Pagination
    ): Promise<(RefundRecord & { paymentRecord: PaymentRecord | null })[] | null> {
        return prismaErrorHandler(
            this.prisma.refundRecord.findMany({
                where: {
                    ...query,
                    OR: [
                        {
                            status: 'pending',
                        },
                    ],
                },
                include: {
                    paymentRecord: true,
                },
                orderBy: {
                    requestedAt: 'desc',
                },
                take: pagination.pageSize,
                skip: calculatePaginationSkip(pagination),
            })
        );
    }

    async getClosedRefundRecordsForMerchantWithPagination(
        query: RefundRecordQuery,
        pagination: Pagination
    ): Promise<(RefundRecord & { paymentRecord: PaymentRecord | null })[] | null> {
        return prismaErrorHandler(
            this.prisma.refundRecord.findMany({
                where: {
                    ...query,
                    OR: [
                        {
                            status: 'paid',
                        },
                        {
                            status: 'completed',
                        },
                        {
                            status: 'rejected',
                        },
                    ],
                },
                include: {
                    paymentRecord: true,
                },
                orderBy: {
                    completedAt: 'desc',
                },
                take: pagination.pageSize,
                skip: calculatePaginationSkip(pagination),
            })
        );
    }

    async getTotalOpenRefundRecordsForMerchant(query: RefundRecordQuery): Promise<number | null> {
        return await prismaErrorHandler(
            this.prisma.refundRecord.count({
                where: {
                    ...query,
                    OR: [
                        {
                            status: 'pending',
                        },
                    ],
                },
            })
        );
    }

    async getTotalClosedRefundRecordsForMerchant(query: RefundRecordQuery): Promise<number | null> {
        return await prismaErrorHandler(
            this.prisma.refundRecord.count({
                where: {
                    ...query,
                    OR: [
                        {
                            status: 'paid',
                        },
                        {
                            status: 'completed',
                        },
                        {
                            status: 'rejected',
                        },
                    ],
                },
            })
        );
    }

    async getPaymentRecordForRefund(query: RefundRecordQuery): Promise<PaymentRecord | null> {
        const refundRecord = await prismaErrorHandler(
            this.prisma.refundRecord.findFirst({
                where: query,
                include: {
                    paymentRecord: true,
                },
            })
        );

        return refundRecord ? refundRecord.paymentRecord : null;
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
