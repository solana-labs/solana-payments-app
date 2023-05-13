import { PrismaClient, TransactionRecord, TransactionType } from '@prisma/client';

// --- TransactionRecordService CRUD Operations ---
// 1. getTransactionRecord
// 2. createTransactionRecord
//
// We currently don't need to support updating Transaction Records
export type SignatureQuery = {
    signature: string;
};

export type TransactionIdQuery = {
    id: number;
};

export type TransactionRecordQuery = SignatureQuery | TransactionIdQuery;

export class TransactionRecordService {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async getTransactionRecord(query: TransactionRecordQuery): Promise<TransactionRecord | null> {
        return await this.prisma.transactionRecord.findFirst({
            where: query,
        });
    }

    async createTransactionRecord(
        signature: string,
        transactionType: TransactionType,
        paymentRecordId: string | null,
        refundRecordId: string | null,
        createdAt: string
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
            createdAt: createdAt,
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
        try {
            return await this.prisma.transactionRecord.create({
                data: transactionRecordData,
            });
        } catch {
            throw new Error('Failed to create transaction record.');
        }
    }
}
