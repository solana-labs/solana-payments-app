import { PrismaClient, PaymentRecord, Merchant } from '@prisma/client'
import { ShopifyPaymentInitiation } from '../../models/process-payment-request.model.js'

export type PaidUpdate = {
    status: string
    redirectUrl: string
}

export type StatusUpdate = {
    status: string
}

export type TransactionSignatureUpdate = {
    transactionSignature: string
}

export type StatusRedirectTransactionUpdate = {
    status: string
    redirectUrl: string
    transactionSignature: string
}

export type PaymentRecordUpdate =
    | PaidUpdate
    | StatusUpdate
    | TransactionSignatureUpdate
    | StatusRedirectTransactionUpdate

export type ShopIdQuery = {
    shopId: string
}

// TODO: Better name for this type
export type IdQuery = {
    id: number
}

export type PaymentRecordQuery = ShopIdQuery | IdQuery

export class PaymentRecordService {
    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient
    }

    // function overloads to query the database by shop or id
    // async getPaymentRecord(id: string): Promise<PaymentRecord | null>
    async getPaymentRecord(
        query: PaymentRecordQuery
    ): Promise<PaymentRecord | null> {
        return await this.prisma.paymentRecord.findFirst({
            where: query,
        })
    }

    async createPaymentRecord(
        paymentInitiation: ShopifyPaymentInitiation,
        merchant: Merchant
    ): Promise<PaymentRecord> {
        return await this.prisma.paymentRecord.create({
            data: {
                status: 'pending',
                shopId: paymentInitiation.id,
                shopGid: paymentInitiation.gid,
                shopGroup: paymentInitiation.group,
                test: paymentInitiation.test,
                amount: paymentInitiation.amount,
                currency: paymentInitiation.currency,
                customerAddress: null,
                merchantId: merchant.id,
                cancelURL: paymentInitiation.payment_method.data.cancel_url,
            },
        })
    }

    async updatePaymentRecord(
        paymentRecord: PaymentRecord,
        update: PaymentRecordUpdate
    ): Promise<PaymentRecord> {
        try {
            return await this.prisma.paymentRecord.update({
                where: {
                    id: paymentRecord.id,
                },
                data: update,
            })
        } catch {
            throw new Error('Failed to update merchant')
        }
    }
}
