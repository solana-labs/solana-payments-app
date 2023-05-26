import { PaymentRecord, RefundRecord } from '@prisma/client';
import { payment } from '../handlers/shopify-handlers/payment.js';

export interface RefundDataResponse {
    shopifyOrder: string;
    requestedAt: Date;
    completedAt?: Date;
    status: string;
    refundAmount: string;
    paymentAmount: string;
}

export const createRefundDataResponseFromRefundRecord = (
    refundRecord: RefundRecord & { paymentRecord: PaymentRecord | null }
): RefundDataResponse => {
    return {
        shopifyOrder: refundRecord.shopId,
        requestedAt: refundRecord.requestedAt,
        ...(refundRecord.completedAt && { completedAt: refundRecord.completedAt }),
        status: refundRecord.status,
        refundAmount: `${refundRecord.amount} ${refundRecord.currency}`,
        paymentAmount: refundRecord.paymentRecord
            ? `${refundRecord.paymentRecord.amount} ${refundRecord.paymentRecord.currency}`
            : 'Not Availible',
    };
};
