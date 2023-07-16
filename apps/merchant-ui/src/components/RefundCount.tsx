import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    refundCount: number;
}

export function RefundCount(props: Props) {
    return (
        <div
            className={twMerge(
                'bg-indigo-100',
                'font-medium',
                'px-2',
                'py-0.5',
                'rounded-full',
                'text-indigo-600',
                'text-xs',
                props.className,
            )}
        >
            {props.refundCount}
        </div>
    );
}
