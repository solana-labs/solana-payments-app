import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';

export enum PaymentStatus {
    Rejected = 'rejected',
    Completed = 'completed',
    Pending = 'pending',
    Paid = 'paid',
}

interface Payment {
    // address: string;
    amount: number;
    orderId: string;
    status: PaymentStatus;
    requestedAt: number;
    completedAt?: number;
    transactionSignature?: string;
    // user: string;
}

function transformPayment(responseData: any): Payment[] {
    return responseData.paymentData.data.map((item: any) => {
        return {
            orderId: item.shopifyOrder,
            status: item.status as PaymentStatus,
            amount: parseFloat(item.amount),
            requestedAt: new Date(item.requestedAt).getTime(),
            ...(item.completedAt && { completedAt: new Date(item.completedAt).getTime() }),
            ...(item.transactionSignature && { transactionSignature: item.transactionSignature }),

            // refundTo: '', // This field needs to be updated based on actual data
        };
    });
}

const PAGE_SIZE = 7;

type PaymentStore = {
    payments: RE.Result<{
        payments: Payment[];
        totalPages: number;
    }>;
    paymentCount: number;
    getPayments: (page: number) => Promise<void>;
};

export const usePaymentStore = create<PaymentStore>(set => ({
    payments: RE.pending(),
    paymentCount: 0,
    getPayments: async (page: number) => {
        const params: any = {
            pageNumber: page + 1,
            pageSize: PAGE_SIZE,
        };

        try {
            const response = await fetch(`${API_ENDPOINTS.paymentData}?${new URLSearchParams(params)}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (response.status !== 200) {
                set({ payments: RE.failed(new Error(data.message || 'Failed to fetch payments')) });
            } else {
                const payments = transformPayment(data);
                set({
                    payments: RE.ok({
                        payments: payments,
                        totalPages: Math.ceil(data.paymentData.total / PAGE_SIZE),
                    }),
                });
                set({ paymentCount: data.paymentData.total });
            }
        } catch (error) {
            set({ payments: RE.failed(new Error('Failed to fetch payments')) });
        }
    },
}));
