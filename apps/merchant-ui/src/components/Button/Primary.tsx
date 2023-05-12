import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { LoadingDots } from '../LoadingDots';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pending?: boolean;
}

export const Primary = forwardRef<HTMLButtonElement, Props>(function Primary(props, ref) {
    const { pending, ...rest } = props;

    return (
        <button
            {...rest}
            ref={ref}
            className={twMerge(
                'bg-indigo-600',
                'flex',
                'group',
                'h-10',
                'items-center',
                'justify-center',
                'px-4',
                'relative',
                'rounded-lg',
                'text-indigo-50',
                'tracking-normal',
                'transition-colors',
                rest.className,
                !pending && 'active:bg-indigo-400',
                'disabled:bg-zinc-300',
                'disabled:cursor-not-allowed',
                !pending && 'hover:bg-indigo-500',
                pending && 'cursor-not-allowed'
            )}
            onClick={e => {
                if (!pending && !rest.disabled) {
                    rest.onClick?.(e);
                }
            }}
        >
            <div
                className={twMerge(
                    'flex',
                    'font-semibold',
                    'items-center',
                    'justify-center',
                    'text-current',
                    'text-sm',
                    'transition-all',
                    'group-disabled:text-neutral-400',
                    pending ? 'opacity-0' : 'opacity-100'
                )}
            >
                {rest.children}
            </div>
            {pending && <LoadingDots className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
        </button>
    );
});
