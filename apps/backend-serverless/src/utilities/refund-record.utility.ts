import { RefundRecord } from '@prisma/client';

export interface RefundDataResponse {
    shopifyOrder: string;
    date: string;
    status: string;
    amount: string;
}

// export type RefundRecord = {
//     id: string;
//     status: string;
//     amount: number;
//     currency: string;
//     shopId: string;
//     shopGid: string;
//     shopPaymentId: string;
//     test: boolean;
//     merchantId: string;
//     transactionSignature: string | null;
// };

export const createRefundDataResponseFromRefundRecord = (refundRecord: RefundRecord): RefundDataResponse => {
    return {
        shopifyOrder: refundRecord.shopId,
        date: 'some-date-here',
        status: refundRecord.status,
        amount: String(refundRecord.amount),
    };
};
