import { twMerge } from 'tailwind-merge';

import { PaymentStatus } from '@/hooks/useMockPayments';

function getText(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Chargeback:
            return 'Chargeback';
        case PaymentStatus.Completed:
            return 'Completed';
        case PaymentStatus.Pending:
            return 'Pending';
        case PaymentStatus.RefundDenied:
            return 'Refund Denied';
        case PaymentStatus.RefundRequested:
            return 'Refund Requested';
        case PaymentStatus.Refunded:
            return 'Refunded';
    }
}

function getBorder(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Chargeback:
            return 'border-red-800';
        case PaymentStatus.Completed:
            return 'border-emerald-800';
        case PaymentStatus.Pending:
            return 'border-emerald-800';
        case PaymentStatus.RefundDenied:
            return 'border-orange-800';
        case PaymentStatus.RefundRequested:
            return 'border-amber-700';
        case PaymentStatus.Refunded:
            return 'border-slate-800';
    }
}

function getBgColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Chargeback:
            return 'bg-red-100';
        case PaymentStatus.Completed:
            return 'bg-emerald-100';
        case PaymentStatus.Pending:
            return 'bg-transparent';
        case PaymentStatus.RefundDenied:
            return 'bg-orange-100';
        case PaymentStatus.RefundRequested:
            return 'bg-amber-50';
        case PaymentStatus.Refunded:
            return 'bg-slate-100';
    }
}

function getTextColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Chargeback:
            return 'text-red-800';
        case PaymentStatus.Completed:
            return 'text-emerald-800';
        case PaymentStatus.Pending:
            return 'text-emerald-800';
        case PaymentStatus.RefundDenied:
            return 'text-orange-800';
        case PaymentStatus.RefundRequested:
            return 'text-amber-700';
        case PaymentStatus.Refunded:
            return 'text-slate-800';
    }
}

interface Props {
    className?: string;
    status: PaymentStatus;
}

export function PaymentsHistoryStatus(props: Props) {
    return (
        <div
            className={twMerge(
                'text-sm',
                'border',
                'px-3',
                'py-1',
                'rounded-2xl',
                getBorder(props.status),
                getBgColor(props.status),
                getTextColor(props.status),
                props.className
            )}
        >
            {getText(props.status)}
        </div>
    );
}
