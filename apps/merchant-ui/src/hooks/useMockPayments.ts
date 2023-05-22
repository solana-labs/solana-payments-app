import { useState, useEffect } from 'react';

import * as RE from '@/lib/Result';

export enum PaymentStatus {
    Chargeback,
    Completed,
    Pending,
    RefundRequested,
    RefundDenied,
    Refunded,
}

interface Payment {
    address: string;
    amount: number;
    orderId: string;
    status: PaymentStatus;
    ts: number;
    user: string;
}

function mockPaymentStatus(index: number) {
    return [
        PaymentStatus.Chargeback,
        PaymentStatus.Completed,
        PaymentStatus.Pending,
        PaymentStatus.RefundRequested,
        PaymentStatus.RefundDenied,
        PaymentStatus.Refunded,
    ][index % 6];
}

const MOCK_paymentS = Array.from({ length: 70 }).map((_, i) => ({
    address: `${i.toString().padStart(2, '0')}3nryBDu2hqmpyAjssubxVda3Si1QAfA9yEAFAdV4TQ`,
    amount: -50 + i * 23.58,
    orderId: `123${i}`,
    status: mockPaymentStatus(i),
    ts: 1681336764686,
    user: 'NR',
}));

const PAGE_SIZE = 7;

export function useMockPayments(page: number): RE.Result<{
    payments: Payment[];
    totalPages: number;
}> {
    const [results, setResults] = useState<
        RE.Result<{
            payments: Payment[];
            totalPages: number;
        }>
    >(RE.pending());

    useEffect(() => {
        setResults(RE.pending());

        setTimeout(() => {
            setResults(
                RE.ok({
                    payments: MOCK_paymentS.slice(page * PAGE_SIZE, PAGE_SIZE + page * PAGE_SIZE),
                    totalPages: 10,
                })
            );
        }, 500);
    }, [page]);

    return results;
}
