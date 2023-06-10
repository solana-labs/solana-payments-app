import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

import { PaginatedTable } from '@/components/PaginatedTable';
import * as RE from '@/lib/Result';
import { formatPrice } from '@/lib/formatPrice';
import { RefundStatus, useClosedRefundStore } from '@/stores/refundStore';
import { useEffect, useState } from 'react';

interface Props {
    className?: string;
}

export function ClosedRefunds(props: Props) {
    const [page, setPage] = useState(0);
    const [totalNumPages, setTotalNumPages] = useState(0);

    const closedRefunds = useClosedRefundStore(state => state.closedRefunds);

    useEffect(() => {
        if (RE.isOk(closedRefunds)) {
            setTotalNumPages(closedRefunds.data.totalPages);
        }
    }, [closedRefunds]);

    if (RE.isOk(closedRefunds) && closedRefunds.data.refunds.length === 0) {
        return (
            <div className={props.className}>
                <div>
                    <div className="text-lg font-semibold md:px-7">Closed Refunds</div>
                    <div className="mt-8 text-center">
                        <div className="text-sm font-medium text-neutral-600">No Closed Refunds!</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PaginatedTable
            className={twMerge(props.className, 'mt-8')}
            columns={['orderId', 'requestedAt', 'requestedRefundAmount', 'purchaseAmount', 'status']}
            curPage={RE.map(closedRefunds, ({ refunds }) => refunds)}
            headers={{
                orderId: 'Shopify Order ID',
                requestedAt: 'Requested On',
                requestedRefundAmount: 'Requested Refund',
                purchaseAmount: 'Purchase Amount',
                status: 'Status',
            }}
            numPages={totalNumPages}
            rowHeight={'h-20'}
            rowsPerPage={5}
            onPageChange={setPage}
        >
            {{
                orderId: orderId => (
                    <div
                        className={twMerge(
                            'border-b',
                            'border-gray-200',
                            'flex',
                            'font-semibold',
                            'h-20',
                            'items-center',
                            'text-black',
                            'text-overflow'
                        )}
                        key={orderId}
                    >
                        {orderId.length > 6 ? orderId.substring(0, 6) + '...' : orderId}
                    </div>
                ),
                requestedAt: requestedAt => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {format(requestedAt, 'MMM d, h:mmaa')}
                    </div>
                ),
                requestedRefundAmount: requestedRefundAmount => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {formatPrice(Math.abs(requestedRefundAmount))}
                    </div>
                ),
                purchaseAmount: purchaseAmount => (
                    <div
                        className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center', 'text-black')}
                    >
                        {formatPrice(Math.abs(purchaseAmount))}
                    </div>
                ),
                status: (_, refund) => (
                    <div className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center')}>
                        {refund.status === RefundStatus.Paid && (
                            <div
                                className={twMerge(
                                    'border',
                                    'border-slate-700',
                                    'px-3',
                                    'py-1',
                                    'rounded-3xl',
                                    'text-slate-700',
                                    'text-sm',
                                    'font-medium',
                                    'bg-slate-50'
                                )}
                            >
                                Refunded
                            </div>
                        )}
                        {refund.status === RefundStatus.Rejected && (
                            <div
                                className={twMerge(
                                    'border',
                                    'border-red-700',
                                    'px-3',
                                    'py-1',
                                    'rounded-3xl',
                                    'text-red-700',
                                    'text-sm',
                                    'font-medium',
                                    'bg-red-50'
                                )}
                            >
                                Refund Denied
                            </div>
                        )}
                    </div>
                ),
            }}
        </PaginatedTable>
    );
}
