import { PaymentRecord } from '@prisma/client';

export interface PaymentDataResponse {
    shopifyOrder: string;
    requestedAt: Date;
    completedAt?: Date;
    status: string;
    amount: string;
}

export const createPaymentDataResponseFromPaymentRecord = (paymentRecord: PaymentRecord): PaymentDataResponse => {
    console.log('date', paymentRecord.requestedAt, paymentRecord.completedAt);
    return {
        shopifyOrder: paymentRecord.shopId,
        requestedAt: paymentRecord.requestedAt,
        ...(paymentRecord.completedAt && { completedAt: paymentRecord.completedAt }),
        status: paymentRecord.status,
        amount: paymentRecord.amount ? `${paymentRecord.amount} ${paymentRecord.currency}` : 'Not Availible',
    };
};
