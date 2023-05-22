import { useState, useEffect } from 'react';

import * as RE from '@/lib/Result';
import { API_ENDPOINTS } from '@/lib/endpoints';
import axios from 'axios';

export enum RefundStatus {
    AwaitingAction = 'AwaitingAction',
    RefundApproved = 'RefundApproved',
    RefundDenied = 'RefundDenied',
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
    requestedOn: number; //date

    refundTo: string;
}

export interface OpenRefund extends Refund {
    status: RefundStatus.AwaitingAction;
}

export interface ClosedRefund extends Refund {
    status: RefundStatus.RefundApproved | RefundStatus.RefundDenied;
}

function refundIsOpen(refund: Refund): refund is OpenRefund {
    return refund.status === RefundStatus.AwaitingAction;
}

function refundIsClosed(refund: Refund): refund is ClosedRefund {
    return refund.status !== RefundStatus.AwaitingAction;
}

function transformRefund(responseData: any): OpenRefund[] {
    console.log('in transform', responseData);
    return responseData.refundData.data.map((item: any) => {
        console.log('item: ', item);
        return {
            orderId: item.shopifyOrder,
            status: item.status as RefundStatus,
            purchaseAmount: parseFloat(item.amount),
            requestedRefundAmount: parseFloat(item.amount),
            requestedOn: 1681336764686,
            refundTo: '', // This field needs to be updated based on actual data
        };
    });
}

export function useOpenRefunds(): RE.Result<OpenRefund[]> {
    const [results, setResults] = useState<RE.Result<OpenRefund[]>>(RE.pending());

    const params: any = {
        page: 1,
        pageSize: 10,
        refundStatus: 'pending',
    };

    useEffect(() => {
        async function fetchRefunds() {
            setResults(RE.pending());
            try {
                const response = await axios.get(API_ENDPOINTS.refundData, { params });

                if (response.status !== 200) {
                    setResults(RE.failed(new Error(response.data.message || 'Failed to fetch refunds')));
                } else {
                    const refunds = transformRefund(response.data); // assuming you have transformRefund function
                    setResults(RE.ok(refunds));
                }
            } catch (error) {
                console.log('error: ', error);
                setResults(RE.failed(new Error('Failed to fetch open refunds')));
            }
        }

        fetchRefunds();
    }, []);

    return results;
}

export function useCloseRefunds(): RE.Result<OpenRefund[]> {
    const [results, setResults] = useState<RE.Result<OpenRefund[]>>(RE.pending());

    const params: any = {
        page: 1,
        pageSize: 10,
        refundStatus: 'rejected',
    };

    useEffect(() => {
        async function fetchRefunds() {
            setResults(RE.pending());
            try {
                const responseRejected = await axios.get(API_ENDPOINTS.refundData, { params });

                if (responseRejected.status !== 200) {
                    setResults(RE.failed(new Error(responseRejected.data.message || 'Failed to fetch refunds')));
                } else {
                    const refundsRejected = transformRefund(responseRejected.data); // assuming you have transformRefund function
                    setResults(RE.ok(refundsRejected));
                }
            } catch (error) {
                console.log('error: ', error);
                setResults(RE.failed(new Error('Failed to fetch refunds in useCloseRefunds')));
            }
        }

        fetchRefunds();
    }, []);

    console.log('results: ', results);

    return results;
}
