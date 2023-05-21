import { PaymentRecord } from '@prisma/client';

export interface PaymentDataResponse {
    shopifyOrder: string;
    date: string;
    status: string;
    amount: string;
}

export const createPaymentDataResponseFromPaymentRecord = (paymentRecord: PaymentRecord): PaymentDataResponse => {
    return {
        shopifyOrder: paymentRecord.shopId,
        date: 'some-date-here',
        status: paymentRecord.status,
        amount: 'convert-amount-to-string-here',
    };
};
