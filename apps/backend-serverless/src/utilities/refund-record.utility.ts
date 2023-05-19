import { PaymentRecord, RefundRecord } from '@prisma/client';
import { payment } from '../handlers/shopify-handlers/payment.js';

export interface RefundDataResponse {
    shopifyOrder: string;
    date: string;
    status: string;
    refundAmount: string;
    paymentAmount: string;
}

export const createRefundDataResponseFromRefundRecord = (
    refundRecord: RefundRecord & { paymentRecord: PaymentRecord | null }
): RefundDataResponse => {
    return {
        shopifyOrder: refundRecord.shopId,
        date: 'some-date-here',
        status: 'pending',
        refundAmount: `${refundRecord.amount} ${refundRecord.currency}`,
        paymentAmount: refundRecord.paymentRecord
            ? `${refundRecord.paymentRecord.amount} ${refundRecord.paymentRecord.currency}`
            : 'Not Availible',
    };
};
