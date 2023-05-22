import { useState, useEffect } from 'react';

import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import axios from 'axios';

export enum PaymentStatus {
    Rejected = 'rejected',
    Completed = 'completed',
    Pending = 'pending',
    Paid = 'paid',
}

// interface ServerPayment {}

interface Payment {
    // address: string;
    amount: number;
    orderId: string;
    status: PaymentStatus;
    ts: number;
    // user: string;
}

function transformPayment(responseData: any): Payment[] {
    return responseData.paymentData.data.map((item: any) => {
        return {
            orderId: item.shopifyOrder,
            status: item.status as PaymentStatus,
            amount: parseFloat(item.amount),
            ts: 1681336764686,
            // refundTo: '', // This field needs to be updated based on actual data
        };
    });
}

const PAGE_SIZE = 7;

export function usePayments(page: number): RE.Result<{
    payments: Payment[];
    totalPages: number;
}> {
    const [results, setResults] = useState<
        RE.Result<{
            payments: Payment[];
            totalPages: number;
        }>
    >(RE.pending());

    const params: any = {
        page: page + 1,
        pageSize: PAGE_SIZE,
    };

    useEffect(() => {
        async function fetchPayments() {
            setResults(RE.pending());
            try {
                const response = await axios.get(API_ENDPOINTS.paymentData, { params });

                if (response.status !== 200) {
                    setResults(RE.failed(new Error(response.data.message || 'Failed to fetch payments')));
                } else {
                    console.log('response.data: ', response.data);
                    const payments = transformPayment(response.data); // assuming you have transformRefund function
                    setResults(RE.ok({ payments: payments, totalPages: response.data.general.refundBadges }));
                }
            } catch (error) {
                console.log('error: ', error);
                setResults(RE.failed(new Error('Failed to fetch open payments')));
            }
        }

        fetchPayments();
    }, []);

    return results;
}
