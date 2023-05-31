import { useState, useEffect } from 'react';
import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import axios from 'axios';

const PAGE_SIZE = 5;

export enum RefundStatus {
    Pending = 'pending',
    Paid = 'paid',
    Rejected = 'rejected',
}

interface ServerRefund {
    id: string; // Internal ID
    status: RefundStatus;
    amount: number;

    currency: string;
    shopId: string; // Given Id from Shopify
    shopGid: string; // Given Gid from Shopify
    shopPaymentId: string; // Given payment_id from Shopify, it will link to the 'shopId' in our database or 'id' from Shopify
    test: boolean;
    merchantId: string;
    transactionSignature?: string; // Signature of the on-chain transaction that was used to settle the payment with Shopify
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

export interface OpenRefund extends Refund {
    status: RefundStatus.Pending;
}

export interface ClosedRefund extends Refund {
    status: RefundStatus.Paid | RefundStatus.Rejected;
}

function refundIsOpen(refund: Refund): refund is OpenRefund {
    return refund.status === RefundStatus.Pending;
}

function refundIsClosed(refund: Refund): refund is ClosedRefund {
    return refund.status !== RefundStatus.Pending;
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

export function useOpenRefunds(page: number = 0): {
    openRefunds: RE.Result<{ refunds: OpenRefund[]; totalPages: number }>;
    refundCount: number;
    fetchOpenRefunds: () => void;
} {
    const [results, setResults] = useState<RE.Result<{ refunds: OpenRefund[]; totalPages: number }>>(RE.pending());
    const [refundCount, setRefundCount] = useState<number>(0);

    async function fetchOpenRefunds() {
        const params: any = {
            pageNumber: page + 1,
            pageSize: 5,
            refundStatus: 'pending',
        };

    async function fetchOpenRefunds() {
        setResults(RE.pending());
        try {
            const response = await axios.get(API_ENDPOINTS.refundData, { params });

            if (response.status !== 200) {
                setResults(RE.failed(new Error(response.data.message || 'Failed to fetch payments 200')));
            } else {
                const refunds = transformRefund<OpenRefund>(response.data); // assuming you have transformRefund function
                console.log('fetching total', response.data.refundData.total);
                setResults(
                    RE.ok({
                        refunds: refunds,
                        totalPages: Math.floor(response.data.refundData.total / PAGE_SIZE) + 1,
                    })
                );
                setRefundCount(response.data.refundData.total);
            }
        } catch (error) {
            console.log('error: ', error);
            setResults(RE.failed(new Error('Failed to fetch open refunds')));
        }
    }

    useEffect(() => {
        fetchOpenRefunds();
    }, [page]);

    return { openRefunds: results, refundCount, fetchOpenRefunds };
}

export function useCloseRefunds(page: number = 0): {

    fetchClosedRefunds: () => void;
} {
    const [results, setResults] = useState<RE.Result<{ refunds: ClosedRefund[]; totalPages: number }>>(RE.pending());

    async function fetchClosedRefunds() {
        const params: any = {
            page: page + 1,
            pageSize: PAGE_SIZE,
        };

        setResults(RE.pending());
        try {
            const responseRejected = await axios.get(API_ENDPOINTS.refundData, {
                params: { ...params, refundStatus: 'rejected' },
            });
            const responsePaid = await axios.get(API_ENDPOINTS.refundData, {
                params: { ...params, refundStatus: 'paid' },
            });

            if (responseRejected.status !== 200 || responsePaid.status !== 200) {
                let errorMsg = 'Failed to fetch refunds';
                if (responseRejected.status !== 200) {
                    errorMsg = responseRejected.data.message || errorMsg;
                }
                if (responsePaid.status !== 200) {
                    errorMsg = responsePaid.data.message || errorMsg;
                }
                setResults(RE.failed(new Error(errorMsg)));
            } else {
                const refundsRejected = transformRefund<ClosedRefund>(responseRejected.data);
                const refundsPaid = transformRefund<ClosedRefund>(responsePaid.data);
                const refunds = [...refundsRejected, ...refundsPaid];
                setResults(
                    RE.ok({
                        refunds,
                        totalPages:
                            Math.floor(
                                (responseRejected.data.refundData.total + responsePaid.data.refundData.total) /
                                    PAGE_SIZE
                            ) + 1,
                    })
            }
        } catch (error) {
            console.log('error: ', error);
            setResults(RE.failed(new Error('Failed to fetch refunds in useCloseRefunds')));
        }
    }

    useEffect(() => {
        fetchClosedRefunds();
    }, []);

    return { closedRefunds: results, fetchClosedRefunds };
}
