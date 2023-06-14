import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';

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

const PAGE_SIZE = 7;

export const useOpenRefundStore = create<OpenRefundStore>(set => ({
    openRefunds: RE.pending(),
    refundCount: 0,
    getOpenRefunds: async (page: number) => {
        const params: any = {
            pageNumber: page + 1,
            pageSize: 5,
            refundStatus: 'open',
        };

        try {
            const response = await fetch(`${API_ENDPOINTS.refundData}?${new URLSearchParams(params)}`);

            const data = await response.json();
            if (response.status !== 200) {
                set({ openRefunds: RE.failed(new Error('Failed to fetch open refunds')) });
            }
            const refunds = transformRefund<OpenRefund>(data); // assuming you have transformRefund function

            set({
                openRefunds: RE.ok({
                    refunds: refunds,
                    totalPages: Math.floor((data.refundData.total + 1) / PAGE_SIZE),
                }),
            });
            set({ refundCount: data.refundData.total });
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
            refundStatus: 'closed',
        };

        try {
            const responseClosed = await fetch(`${API_ENDPOINTS.refundData}?${new URLSearchParams(params)}`);
            const dataClosed = await responseClosed.json();

            if (responseClosed.status !== 200) {
                let errorMsg = 'Failed to fetch closed refunds';
                set({ closedRefunds: RE.failed(new Error(errorMsg)) });
            } else {
                const refundsClosed = transformRefund<ClosedRefund>(dataClosed);
                const refunds = [...refundsClosed];
                set({
                    closedRefunds: RE.ok({
                        refunds: refunds,
                        totalPages: Math.floor((dataClosed.refundData.total + 1) / PAGE_SIZE),
                    }),
                });
                set({ refundCount: dataClosed.refundData.total });
            }
        } catch (error) {
            console.log('error: ', error);
            // TODO handle this failure better
            set({ closedRefunds: RE.failed(new Error('Failed to fetch closed refunds')) });
        }
    },
}));
