import { PrismaClient, Merchant, RefundRecord } from '@prisma/client'
import { ShopifyRefundInitiation } from '../../models/process-refund.request.model.js'

export type PaidUpdate = {
    status: string
}

export type StatusUpdate = {
    status: string
}

export type RefundRecordUpdate = PaidUpdate

export type ShopIdQuery = {
    shopId: string
}

export type RefundIdQuery = {
    id: number
}

export type RefundRecordQuery = ShopIdQuery | RefundIdQuery

// --- RefundRecordService CRUD Operations ---
// 1. getRefundRecord
// 2. createRefundRecord
// 3. updateRefundRecord
export class RefundRecordService {
    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    async getRefundRecord(
        query: RefundRecordQuery
    ): Promise<RefundRecord | null> {
        return await this.prisma.refundRecord.findFirst({
            where: query,
        })
    }

    async createRefundRecord(
        refundInitiation: ShopifyRefundInitiation,
        merchant: Merchant
    ): Promise<RefundRecord> {
        return await this.prisma.refundRecord.create({
            data: {
                status: 'pending',
                amount: refundInitiation.amount,
                currency: refundInitiation.currency,
                shopId: refundInitiation.id,
                shopGid: refundInitiation.gid,
                shopPaymentId: refundInitiation.payment_id,
                test: refundInitiation.test,
                merchantId: merchant.id,
            },
        })
    }

    async updateRefundRecord(
        refundRecord: RefundRecord,
        update: RefundRecordUpdate
    ): Promise<RefundRecord> {
        try {
            return await this.prisma.refundRecord.update({
                where: {
                    id: refundRecord.id,
                },
                data: update,
            })
        } catch {
            throw new Error('Failed to update merchant')
        }
    }
}
