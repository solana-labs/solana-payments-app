import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

import * as RE from '@/lib/Result';
import { formatPrice } from '@/lib/formatPrice';
import { RefundStatus, useCloseRefunds } from '@/hooks/useRefunds';

interface Props {
    className?: string;
}

export function ClosedRefunds(props: Props) {
    const closedRefunds = useCloseRefunds();

    return (
        <div className={twMerge('grid', 'grid-cols-[1fr,repeat(4,max-content)]', props.className)}>
            {RE.match(
                closedRefunds,
                () => (
                    <div />
                ),
                () => (
                    <div />
                ),
                refunds => (
                    <>
                        {['Shopify Order #', 'Requested On', 'Requested Refund', 'Purchase Amount', 'Status'].map(
                            (label, i) => (
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'font-semibold',
                                        'py-3',
                                        'text-slate-600',
                                        'text-sm',
                                        i < 4 && 'pr-14'
                                    )}
                                    key={label}
                                >
                                    {label}
                                </div>
                            )
                        )}
                        {refunds.map(refund => (
                            <>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'font-semibold',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {refund.orderId.length > 6
                                        ? refund.orderId.substring(0, 6) + '...'
                                        : refund.orderId}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {format(refund.requestedAt, 'MMM d, h:mmaaaaa')}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {refund.requestedRefundAmount >= 0 ? '+' : '-'}$
                                    {formatPrice(Math.abs(refund.requestedRefundAmount))}
                                </div>
                                <div
                                    className={twMerge(
                                        'border-b',
                                        'border-gray-200',
                                        'flex',
                                        'h-20',
                                        'items-center',
                                        'text-black'
                                    )}
                                >
                                    {refund.purchaseAmount >= 0 ? '+' : '-'}$
                                    {formatPrice(Math.abs(refund.purchaseAmount))}
                                </div>
                                <div className={twMerge('border-b', 'border-gray-200', 'flex', 'h-20', 'items-center')}>
                                    {refund.status === RefundStatus.RefundApproved && (
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
                                    {refund.status === RefundStatus.RefundDenied && (
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
                            </>
                        ))}
                    </>
                )
            )}
        </div>
    );
}
