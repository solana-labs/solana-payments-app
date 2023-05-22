import { twMerge } from 'tailwind-merge';

import { PaymentStatus } from '@/hooks/usePayments';

function getText(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Pending:
            return 'Pending';
        case PaymentStatus.Paid:
            return 'Paid';
        case PaymentStatus.Completed:
            return 'Completed';
        case PaymentStatus.Rejected:
            return 'Rejected';
    }
}

function getBorder(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Rejected:
            return 'border-red-800';
        case PaymentStatus.Completed:
            return 'border-emerald-800';
        case PaymentStatus.Pending:
            return 'border-orange-800';
        case PaymentStatus.Pending:
            return 'border-amber-700';
    }
}

function getBgColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Rejected:
            return 'bg-red-100';
        case PaymentStatus.Completed:
            return 'bg-emerald-100';
        case PaymentStatus.Pending:
            return 'bg-transparent';
        case PaymentStatus.Pending:
            return 'bg-amber-50';
    }
}

function getTextColor(status: PaymentStatus): string {
    switch (status) {
        case PaymentStatus.Rejected:
            return 'text-red-800';
        case PaymentStatus.Completed:
            return 'text-emerald-800';
        case PaymentStatus.Pending:
            return 'text-emerald-800';
        case PaymentStatus.Pending:
            return 'text-amber-700';
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
