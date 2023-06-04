import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { create } from 'zustand';
import axios from 'axios';

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

        set({ payments: RE.pending() });

        try {
            const response = await axios.get(API_ENDPOINTS.paymentData, { params });

            if (response.status !== 200) {
                set({ payments: RE.failed(new Error(response.data.message || 'Failed to fetch payments')) });
            } else {
                const payments = transformPayment(response.data);
                set({
                    payments: RE.ok({
                        payments: payments,
                        totalPages: Math.floor(response.data.paymentData.total / PAGE_SIZE) + 1,
                    }),
                });
                set({ paymentCount: response.data.paymentData.total });
            }
        } catch (error) {
            console.log('error: ', error);
            set({ payments: RE.failed(new Error('Failed to fetch payments')) });
        }
    },
}));
