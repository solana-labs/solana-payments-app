import { PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';
import { MissingExpectedDatabaseRecordError } from '../../errors/missing-expected-database-record.error.js';
import { prismaErrorHandler } from './shared.database.service.js';

// --- TransactionRecordService CRUD Operations ---
// 1. getTransactionRecord
// 2. createTransactionRecord
//
// We currently don't need to support updating Transaction Records
export type SignatureQuery = {
    signature: string;
};

export type SignaturesQuery = {
    signatures: string[];
};

export type TransactionIdQuery = {
    id: number;
};

export type TransactionRecordQuery = SignatureQuery | TransactionIdQuery;

export type TransactionRecordsQuery = SignaturesQuery;

export class TransactionRecordService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getTransactionRecord(query: TransactionRecordQuery): Promise<TransactionRecord> {
        const transaction = await this.prisma.transactionRecord.findFirst({
            where: query,
        });
        if (transaction == null) {
            throw new MissingExpectedDatabaseRecordError(
                'Could not find transaction ' + JSON.stringify(query) + ' in database'
            );
        }
        return transaction;
    }

    async getTransactionRecords(signatures: string[]): Promise<TransactionRecord[]> {
        const transactions = await this.prisma.transactionRecord.findMany({
            where: { signature: { in: signatures } },
        });

        if (transactions == null) {
            throw new MissingExpectedDatabaseRecordError(
                'Could not find transactions ' + JSON.stringify(signatures) + ' in database'
            );
        }
        return transactions;
    }

    async getTransactionRecordsForPendingPayments(): Promise<TransactionRecord[]> {
        return await this.prisma.transactionRecord.findMany({
            where: {
                paymentRecord: {
                    status: 'pending',
                },
            },
        });
    }

    async getTransactionRecordsForPendingRefunds(): Promise<TransactionRecord[]> {
        return await this.prisma.transactionRecord.findMany({
            where: {
                refundRecord: {
                    status: 'pending',
                },
            },
        });
    }

    async createTransactionRecord(
        signature: string,
        transactionType: TransactionType,
        paymentRecordId: string | null,
        refundRecordId: string | null,
        paidWithPoints: boolean = false
    ): Promise<TransactionRecord> {
        if (paymentRecordId == null && refundRecordId == null) {
            throw new Error('paymentRecordId and refundRecordId cannot both be null');
        }

        if (paymentRecordId != null && refundRecordId != null) {
            throw new Error('paymentRecordId and refundRecordId cannot both be populated');
        }

        if (transactionType == TransactionType.payment && paymentRecordId == null) {
            throw new Error('paymentRecordId must be populated for payment transaction');
        }

        if (transactionType == TransactionType.refund && refundRecordId == null) {
            throw new Error('refundRecordId must be populated for refund transaction');
        }

        // Create the base transaction record data
        const transactionRecordData = {
            signature: signature,
            type: transactionType,
            createdAt: new Date(),
            paidWithPoints: paidWithPoints,
        };

        // Depending on the transaction type, add the correct record ID
        switch (transactionType) {
            case TransactionType.payment:
                transactionRecordData['paymentRecordId'] = paymentRecordId;
                break;
            case TransactionType.refund:
                transactionRecordData['refundRecordId'] = refundRecordId;
                break;
        }

        // Create the transaction record
        return prismaErrorHandler(
            this.prisma.transactionRecord.create({
                data: transactionRecordData,
            })
        );
    }
}
