import { PaymentRecord, PrismaClient, RefundRecord, TransactionRecord } from '@prisma/client';
import axios from 'axios';
import { PaymentRecordService } from './payment-record-service.database.service.js';
import { RefundRecordService } from './refund-record-service.database.service.js';

export type ShopifyRecord = PaymentRecord | RefundRecord;
export type PaymentRejectResponse = {};
export type RefundRejectResponse = {};
export type ShopifyRejectResponse = PaymentRejectResponse | RefundRejectResponse;
export type PaymentResolveResponse = {
    redirectUrl: string;
};
export type RefundResolveResponse = {};
export type ShopifyResolveResponse = PaymentResolveResponse | RefundResolveResponse;

export type TransactionRecordRecordQuery = {
    transactionRecord: TransactionRecord;
};
export type RecordIdRecordQuery = {
    recordId: string;
};
export type RecordQuery = TransactionRecordRecordQuery | RecordIdRecordQuery;

export interface RecordService<RecordType, ResolveResponse> {
    getRecordFromTransactionRecord: (transactionRecord: TransactionRecord) => Promise<RecordType | null>;
    updateRecordToPaid: (recordId: string, transactionSignature: string) => Promise<RecordType>;
    updateRecordToCompleted: (recordId: string, resolveResponse: ResolveResponse) => Promise<RecordType>;
    resolveSession: (record: RecordType, axiosInstance: typeof axios) => Promise<ResolveResponse>;
    sendResolveRetry: (record: RecordType) => Promise<void>;
}

export const getRecordServiceForTransaction = async (
    transactionRecord: TransactionRecord,
    prisma: PrismaClient
): Promise<RecordService<ShopifyRecord, ShopifyResolveResponse>> => {
    switch (transactionRecord.type) {
        case 'payment':
            return new PaymentRecordService(prisma);
        case 'refund':
            return new RefundRecordService(prisma);
    }
};
