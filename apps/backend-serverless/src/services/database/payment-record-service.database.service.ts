import {
    PrismaClient,
    PaymentRecord,
    Merchant,
    PaymentRecordStatus,
    PaymentRecordRejectionReason,
    WebsocketSession,
    TransactionRecord,
} from '@prisma/client';
import { ShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model.js';
import { Pagination, calculatePaginationSkip } from '../../utilities/clients/merchant-ui/database-services.utility.js';
import { prismaErrorHandler } from './shared.database.service.js';
import { PaymentResolveResponse, RecordService } from './record-service.database.service.js';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service.js';
import axios from 'axios';
import { MerchantService } from './merchant-service.database.service.js';
import { validatePaymentSessionResolved } from '../shopify/validate-payment-session-resolved.service.js';
import { sendPaymentResolveRetryMessage } from '../sqs/sqs-send-message.service.js';

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

export class PaymentRecordService implements RecordService<PaymentRecord, PaymentResolveResponse> {
    private prisma: PrismaClient;
    private merchantService: MerchantService;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
        this.merchantService = new MerchantService(prismaClient);
    }

    async getRecord(transactionRecord: TransactionRecord): Promise<PaymentRecord | null> {
        if (transactionRecord.paymentRecordId == null) {
            throw new Error('Transaction record does not have a payment record id');
        }

        return prismaErrorHandler(
            this.prisma.paymentRecord.findFirst({
                where: {
                    id: transactionRecord.paymentRecordId,
                },
            })
        );
    }

    async updateRecordToPaid(recordId: string, transactionSignature: string): Promise<PaymentRecord> {
        return await prismaErrorHandler(
            this.prisma.paymentRecord.update({
                where: {
                    id: recordId,
                },
                data: {
                    status: PaymentRecordStatus.paid,
                    transactionSignature: transactionSignature,
                },
            })
        );
    }

    async updateRecordToCompleted(recordId: string, resolveResponse: PaymentResolveResponse): Promise<PaymentRecord> {
        return await prismaErrorHandler(
            this.prisma.paymentRecord.update({
                where: {
                    id: recordId,
                },
                data: {
                    status: PaymentRecordStatus.completed,
                    redirectUrl: resolveResponse.redirectUrl,
                    completedAt: new Date(),
                },
            })
        );
    }

    async resolveSession(record: PaymentRecord, axiosInstance: typeof axios): Promise<PaymentResolveResponse> {
        const merchant = await this.merchantService.getMerchant({ id: record.merchantId });

        if (merchant == null) {
            throw new Error('Merchant not found');
        }

        if (merchant.accessToken == null) {
            throw new Error('Merchant access token not found');
        }

        const paymentSessionResolve = makePaymentSessionResolve(axiosInstance);

        const resolvePaymentResponse = await paymentSessionResolve(record.shopGid, merchant.shop, merchant.accessToken);

        const resolvePaymentData = validatePaymentSessionResolved(resolvePaymentResponse);

        return {
            redirectUrl: resolvePaymentData.redirectUrl,
        };
    }

    async sendResolveRetry(record: PaymentRecord) {
        await sendPaymentResolveRetryMessage(record.id);
    }

    async getPaymentRecord(query: PaymentRecordQuery): Promise<PaymentRecord | null> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.findFirst({
                where: query,
            })
        );
    }

    async getPaymentRecordsForMerchantWithPagination(
        query: PaymentRecordQuery,
        pagination: Pagination
    ): Promise<PaymentRecord[] | null> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.findMany({
                where: query,
                take: pagination.pageSize,
                skip: calculatePaginationSkip(pagination),
            })
        );
    }

    async getPaymentRecordAndWebsocketServiceForTransactionSignature(
        transactionSignature: string
        // ): Promise<{ paymentRecord: PaymentRecord | null; websocketSessions: WebsocketSession[] }> {
    ): Promise<{ websocketSessions: WebsocketSession[] }> {
        const transactionRecord = await prismaErrorHandler(
            this.prisma.transactionRecord.findUnique({
                where: { signature: transactionSignature },
                include: {
                    paymentRecord: {
                        include: {
                            websocketSessions: true,
                        },
                    },
                },
            })
        );

        if (transactionRecord && transactionRecord.paymentRecord) {
            return {
                // paymentRecord: transactionRecord.paymentRecord,
                websocketSessions: transactionRecord.paymentRecord.websocketSessions || [],
            };
        }

        // return { paymentRecord: null, websocketSessions: [] };
        return { websocketSessions: [] };
    }

    async getTotalPaymentRecordsForMerchant(query: PaymentRecordQuery): Promise<number> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.count({
                where: query,
            })
        );
    }

    async createPaymentRecord(
        id: string,
        paymentInitiation: ShopifyPaymentInitiation,
        merchant: Merchant,
        usdcAmount: number
    ): Promise<PaymentRecord> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.create({
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
            })
        );
    }

    async updatePaymentRecord(paymentRecord: PaymentRecord, update: PaymentRecordUpdate): Promise<PaymentRecord> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.update({
                where: {
                    id: paymentRecord.id,
                },
                data: update,
            })
        );
    }
}
