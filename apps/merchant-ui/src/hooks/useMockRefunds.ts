import { useState, useEffect } from 'react';
import * as RE from '@/lib/Result';

export enum RefundStatus {
    AwaitingAction,
    RefundApproved,
    RefundDenied,
}

export interface Refund {
    orderId: string;
    purchaseAmount: number;
    refundTo: string;
    requestedAt: number;
    requestedRefundAmount: number;
    status: RefundStatus;
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

function mockRefundStatus(index: number) {
    return [RefundStatus.AwaitingAction, RefundStatus.RefundApproved, RefundStatus.RefundDenied][index % 3];
}

const MOCK_REFUNDS = Array.from({ length: 8 }).map((_, i) => ({
    orderId: `123${i}`,
    purchaseAmount: -50 + i * 23.58,
    refundTo: '03nryBDu2hqmpyAjssubxVda3Si1QAfA9yEAFAdV4TQ',
    requestedAt: 1681336764686,
    requestedRefundAmount: -50 + i * 23.58,
    status: mockRefundStatus(i),
}));

export function useMockOpenRefunds(): RE.Result<OpenRefund[]> {
    const [results, setResults] = useState<RE.Result<OpenRefund[]>>(RE.pending());

    useEffect(() => {
        setResults(RE.pending());

        setTimeout(() => {
            setResults(RE.ok(MOCK_REFUNDS.filter(refundIsOpen)));
        }, 1000);
    }, []);

    return results;
}

export function useMockClosedRefunds(): RE.Result<ClosedRefund[]> {
    const [results, setResults] = useState<RE.Result<ClosedRefund[]>>(RE.pending());

    useEffect(() => {
        setResults(RE.pending());

        setTimeout(() => {
            setResults(RE.ok(MOCK_REFUNDS.filter(refundIsClosed)));
        }, 1000);
    }, []);

    return results;
}
