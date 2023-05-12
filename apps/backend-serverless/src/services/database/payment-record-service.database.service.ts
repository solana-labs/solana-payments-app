import { PrismaClient, PaymentRecord, Merchant } from '@prisma/client';
import { ShopifyPaymentInitiation } from '../../models/process-payment-request.model.js';

export type PaidUpdate = {
    status: string;
    redirectUrl: string;
};

export type StatusUpdate = {
    status: string;
};

export type TransactionSignatureUpdate = {
    transactionSignature: string;
};

export type StatusRedirectTransactionUpdate = {
    status: string;
    redirectUrl: string;
    transactionSignature: string;
};

export type PaymentRecordUpdate =
    | PaidUpdate
    | StatusUpdate
    | TransactionSignatureUpdate
    | StatusRedirectTransactionUpdate;

export type ShopIdQuery = {
    shopId: string;
};

// TODO: Better name for this type
export type IdQuery = {
    id: string;
};

export type PaymentRecordQuery = ShopIdQuery | IdQuery;

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
                    status: 'pending',
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
<<<<<<< HEAD
            throw new Error('Failed to update merchant');
=======
            throw new Error('Failed to update payment record.');
>>>>>>> 18848750eebbbf5f51640007b85eb26a18821e17
        }
    }
}
