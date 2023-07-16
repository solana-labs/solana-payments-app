import { twMerge } from 'tailwind-merge';

export enum Status {
    Active,
    Inactive,
}

interface Props {
    className?: string;
    status: Status;
}

export function StoreStatusBadge(props: Props) {
    return (
        <div
            className={twMerge(
                'font-medium',
                'inline-flex',
                'items-center',
                'px-2.5',
                'py-0.5',
                'rounded-2xl',
                'space-x-2',
                'text-sm',
                props.status === Status.Active ? 'bg-emerald-50' : 'bg-gray-100',
                props.status === Status.Active ? 'text-green-600' : 'text-slate-700',
                props.className,
            )}
        >
            <div
                className={twMerge(
                    'h-1.5',
                    'w-1.5',
                    'rounded-full',
                    props.status === Status.Active ? 'bg-green-600' : 'bg-slate-700',
                )}
            />
            <div>Store {props.status === Status.Active ? 'active' : 'inactive'}</div>
        </div>
    );
}
