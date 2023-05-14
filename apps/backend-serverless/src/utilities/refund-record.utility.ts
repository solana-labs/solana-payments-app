import { RefundRecord } from '@prisma/client';

interface RefundDataResponse {
    shopifyOrder: string;
    date: string;
    status: string;
    amount: string;
}

export const createRefundDataResponseFromRefundRecord = (refundRecord: RefundRecord): RefundDataResponse => {
    return {
        shopifyOrder: refundRecord.shopId,
        date: 'some-date-here',
        status: 'pending',
        amount: 'convert-amount-to-string-here',
    };
};
