import {
    PrismaClient,
    TransactionRecord,
    TransactionType,
} from '@prisma/client'

// --- TransactionRecordService CRUD Operations ---
// 1. getTransactionRecord
// 2. createTransactionRecord
//
// We currently don't need to support updating Transaction Records
export class TransactionRecordService {
    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    async getTransactionRecord(
        signature: string
    ): Promise<TransactionRecord | null> {
        return await this.prisma.transactionRecord.findFirst({
            where: {
                signature: signature,
            },
        })
    }

    async createTransactionRecord(
        signature: string,
        transactionType: TransactionType,
        paymentRecordId: number | null,
        refundRecordId: number | null,
        createdAt: string
    ): Promise<TransactionRecord> {
        if (paymentRecordId == null && refundRecordId == null) {
            throw new Error(
                'paymentRecordId and refundRecordId cannot both be null'
            )
        }

        if (paymentRecordId != null && refundRecordId != null) {
            throw new Error(
                'paymentRecordId and refundRecordId cannot both be populated'
            )
        }

        if (
            transactionType == TransactionType.payment &&
            paymentRecordId == null
        ) {
            throw new Error(
                'paymentRecordId must be populated for payment transaction'
            )
        }

        if (
            transactionType == TransactionType.refund &&
            refundRecordId == null
        ) {
            throw new Error(
                'refundRecordId must be populated for refund transaction'
            )
        }

        switch (transactionType) {
            case TransactionType.payment:
                return await this.prisma.transactionRecord.create({
                    data: {
                        signature: signature,
                        type: transactionType,
                        paymentRecordId: paymentRecordId,
                        createdAt: createdAt,
                    },
                })
            case TransactionType.refund:
                return await this.prisma.transactionRecord.create({
                    data: {
                        signature: signature,
                        type: transactionType,
                        refundRecordId: refundRecordId,
                        createdAt: createdAt,
                    },
                })
        }
    }
}
