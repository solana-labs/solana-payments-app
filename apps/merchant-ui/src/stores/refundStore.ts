import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';
import axios from 'axios';

export enum RefundStatus {
    Pending = 'pending',
    Paid = 'paid',
    Rejected = 'rejected',
}

export interface OpenRefund extends Refund {
    status: RefundStatus.Pending;
}

export interface ClosedRefund extends Refund {
    status: RefundStatus.Paid | RefundStatus.Rejected;
}

export interface Refund {
    orderId: string;
    status: RefundStatus;
    purchaseAmount: number;
    requestedRefundAmount: number;
    requestedAt: number; //date
    completedAt: number; //date
    refundTo: string;
}

function transformRefund<T extends Refund>(responseData: any): T[] {
    return responseData.refundData.data.map((item: any) => {
        return {
            orderId: item.shopifyOrder,
            status: item.status as RefundStatus,
            purchaseAmount: parseFloat(item.refundAmount.substring(0, item.refundAmount.indexOf(' '))),
            requestedRefundAmount: parseFloat(item.paymentAmount.substring(0, item.paymentAmount.indexOf(' '))),
            requestedAt: new Date(item.requestedAt).getTime(),
            ...(item.completedAt && { completedAt: new Date(item.completedAt).getTime() }),
            refundTo: '', // This field needs to be updated based on actual data
        };
    });
}

type OpenRefundStore = {
    openRefunds: RE.Result<{ refunds: OpenRefund[]; totalPages: number }>;
    refundCount: number;
    getOpenRefunds: (page: number) => Promise<void>;
};

const PAGE_SIZE = 5;

export const useOpenRefundStore = create<OpenRefundStore>(set => ({
    openRefunds: RE.pending(),
    refundCount: 0,
    getOpenRefunds: async (page: number) => {
        const params: any = {
            pageNumber: page + 1,
            pageSize: 5,
            refundStatus: 'pending',
        };

        try {
            const response = await axios.get(API_ENDPOINTS.refundData, { params });

            if (response.status !== 200) {
                set({ openRefunds: RE.failed(new Error('Failed to fetch open refunds')) });
            } else {
                const refunds = transformRefund<OpenRefund>(response.data); // assuming you have transformRefund function
                console.log('fetching total', response.data.refundData.total);
                set({
                    openRefunds: RE.ok({
                        refunds: refunds,
                        totalPages: Math.floor((response.data.refundData.total + 1) / PAGE_SIZE),
                    }),
                });
                set({ refundCount: response.data.refundData.total });
            }
        } catch (error) {
            console.log('error: ', error);
            set({ openRefunds: RE.failed(new Error('Failed to fetch open refunds')) });
        }
    },
}));

type ClosedRefundStore = {
    closedRefunds: RE.Result<{ refunds: ClosedRefund[]; totalPages: number }>;
    refundCount: number;
    getClosedRefunds: (page: number) => Promise<void>;
};

export const useClosedRefundStore = create<ClosedRefundStore>(set => ({
    closedRefunds: RE.pending(),
    refundCount: 0,
    getClosedRefunds: async (page: number) => {
        const params: any = {
            pageNumber: page + 1,
            pageSize: PAGE_SIZE,
        };

        try {
            const responseRejected = await axios.get(API_ENDPOINTS.refundData, {
                params: { ...params, refundStatus: 'rejected' },
            });
            const responsePaid = await axios.get(API_ENDPOINTS.refundData, {
                params: { ...params, refundStatus: 'paid' },
            });

            if (responseRejected.status !== 200 || responsePaid.status !== 200) {
                let errorMsg = 'Failed to fetch closed refunds';
                if (responseRejected.status !== 200) {
                    errorMsg = responseRejected.data.message || errorMsg;
                }
                if (responsePaid.status !== 200) {
                    errorMsg = responsePaid.data.message || errorMsg;
                }
                set({ closedRefunds: RE.failed(new Error(errorMsg)) });
            } else {
                const refundsRejected = transformRefund<ClosedRefund>(responseRejected.data);
                const refundsPaid = transformRefund<ClosedRefund>(responsePaid.data);
                const refunds = [...refundsRejected, ...refundsPaid];
                set({
                    closedRefunds: RE.ok({
                        refunds: refunds,
                        totalPages: Math.floor(
                            (responseRejected.data.refundData.total + responsePaid.data.refundData.total + 1) /
                                PAGE_SIZE
                        ),
                    }),
                });
                set({ refundCount: responseRejected.data.refundData.total + responsePaid.data.refundData.total });
            }
        } catch (error) {
            console.log('error: ', error);
            set({ closedRefunds: RE.failed(new Error('Failed to fetch closed refunds')) });
        }
    },
}));
