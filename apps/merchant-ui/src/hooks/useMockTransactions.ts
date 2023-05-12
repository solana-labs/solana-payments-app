import { useState, useEffect } from 'react';

import * as RE from '@/lib/Result';

export enum TransactionStatus {
    Chargeback,
    Completed,
    Pending,
    RefundRequested,
    RefundDenied,
    Refunded,
}

interface Transaction {
    address: string;
    amount: number;
    orderId: string;
    status: TransactionStatus;
    ts: number;
    user: string;
}

function mockTransactionStatus(index: number) {
    return [
        TransactionStatus.Chargeback,
        TransactionStatus.Completed,
        TransactionStatus.Pending,
        TransactionStatus.RefundRequested,
        TransactionStatus.RefundDenied,
        TransactionStatus.Refunded,
    ][index % 6];
}

const MOCK_TRANSACTIONS = Array.from({ length: 70 }).map((_, i) => ({
    address: `${i.toString().padStart(2, '0')}3nryBDu2hqmpyAjssubxVda3Si1QAfA9yEAFAdV4TQ`,
    amount: -50 + i * 23.58,
    orderId: `123${i}`,
    status: mockTransactionStatus(i),
    ts: 1681336764686,
    user: 'NR',
}));

const PAGE_SIZE = 7;

export function useMockTransactions(page: number): RE.Result<{
    transactions: Transaction[];
    totalPages: number;
}> {
    const [results, setResults] = useState<
        RE.Result<{
            transactions: Transaction[];
            totalPages: number;
        }>
    >(RE.pending());

    useEffect(() => {
        setResults(RE.pending());

        setTimeout(() => {
            setResults(
                RE.ok({
                    transactions: MOCK_TRANSACTIONS.slice(page * PAGE_SIZE, PAGE_SIZE + page * PAGE_SIZE),
                    totalPages: 10,
                })
            );
        }, 500);
    }, [page]);

    return results;
}
