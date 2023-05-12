import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    title: string;
    value: number;
}

export function TransactionsOverviewItem(props: Props) {
    return (
        <div className={twMerge('drop-shadow-sm', 'border-gray-200', 'border', 'p-6', 'rounded-xl', props.className)}>
            <div className="text-sm font-medium text-slate-600">{props.title}</div>
            <div className="mt-2 text-3xl text-slate-900 font-semibold">{props.value}</div>
        </div>
    );
}
