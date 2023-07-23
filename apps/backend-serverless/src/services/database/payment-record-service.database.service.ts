import {
    Merchant,
    PaymentRecord,
    PaymentRecordRejectionReason,
    PaymentRecordStatus,
    PrismaClient,
    TransactionRecord,
    WebsocketSession,
} from '@prisma/client';
import axios from 'axios';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error';
import { ShopifyPaymentInitiation } from '../../models/shopify/process-payment-request.model';
import { Pagination, calculatePaginationSkip } from '../../utilities/clients/merchant-ui/database-services.utility';
import { makePaymentSessionResolve } from '../shopify/payment-session-resolve.service';
import { validatePaymentSessionResolved } from '../shopify/validate-payment-session-resolved.service';
import { sendPaymentResolveRetryMessage } from '../sqs/sqs-send-message.service';
import { WebSocketSessionFetcher } from '../websocket/send-websocket-message.service';
import { MerchantService } from './merchant-service.database.service';
import { PaymentRejectResponse, PaymentResolveResponse, RecordService } from './record-service.database.service';
import { prismaErrorHandler } from './shared.database.service';

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

export type IdQuery = {
    id: string;
};

export type MerchantIdQuery = {
    merchantId: string;
};

export type TransactionSignatureQuery = {
    signatures: string[];
};

export type PaymentRecordQuery = ShopIdQuery | IdQuery | MerchantIdQuery;

export class PaymentRecordService
    implements RecordService<PaymentRecord, PaymentResolveResponse>, WebSocketSessionFetcher<TransactionSignatureQuery>
{
    private prisma: PrismaClient;
    private merchantService: MerchantService;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
        this.merchantService = new MerchantService(prismaClient);
    }

    async getRecordFromTransactionRecord(transactionRecord: TransactionRecord): Promise<PaymentRecord | null> {
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

    async getRecordFromId(id: string): Promise<PaymentRecord | null> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.findFirst({
                where: {
                    id,
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
                    completedAt: new Date(),
                },
            })
        );
    }

    async rejectRecord(record: PaymentRecord): Promise<PaymentRejectResponse> {
        return {};
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

    async getPaymentRecord(query: PaymentRecordQuery): Promise<PaymentRecord> {
        const paymentRecord = await prismaErrorHandler(
            this.prisma.paymentRecord.findFirst({
                where: query,
            })
        );

        if (paymentRecord == null) {
            throw new MissingExpectedDatabaseRecordError('Could not find paymentRecord ' + JSON.stringify(query));
        }
        return paymentRecord;
    }

    async getPaymentRecordsForMerchantWithPagination(
        query: PaymentRecordQuery,
        pagination: Pagination
    ): Promise<PaymentRecord[] | null> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.findMany({
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
                orderBy: {
                    completedAt: 'desc',
                },
                take: pagination.pageSize,
                skip: calculatePaginationSkip(pagination),
            })
        );
    }

    async fetchWebsocketSessions(query: TransactionSignatureQuery): Promise<WebsocketSession[]> {
        return (await this.getPaymentRecordAndWebsocketServiceForTransactionSignatures(query.signatures))
            .websocketSessions;
    }

    async getPaymentRecordAndWebsocketServiceForTransactionSignature(
        transactionSignature: string
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

    async getPaymentRecordAndWebsocketServiceForTransactionSignatures(
        transactionSignatures: string[]
    ): Promise<{ websocketSessions: WebsocketSession[] }> {
        const transactionRecords = await prismaErrorHandler(
            this.prisma.transactionRecord.findMany({
                where: { signature: { in: transactionSignatures } },
                include: {
                    paymentRecord: {
                        include: {
                            websocketSessions: true,
                        },
                    },
                },
            })
        );

        let websocketSessions: WebsocketSession[] = [];
        transactionRecords.forEach(record => {
            if (record && record.paymentRecord) {
                websocketSessions = [...websocketSessions, ...(record.paymentRecord.websocketSessions || [])];
            }
        });

        return { websocketSessions: websocketSessions };
    }

    async getTotalPaymentRecordsForMerchant(query: PaymentRecordQuery): Promise<number> {
        return prismaErrorHandler(
            this.prisma.paymentRecord.count({
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
