import { PaymentRecord } from '@prisma/client';

interface PaymentDataResponse {
    shopifyOrder: string;
    date: string;
    status: string;
    amount: string;
}

export const createPaymentDataResponseFromPaymentRecord = (paymentRecord: PaymentRecord): PaymentDataResponse => {
    return {
        shopifyOrder: paymentRecord.shopId,
        date: 'some-date-here',
        status: 'pending',
        amount: 'convert-amount-to-string-here',
    };
};
