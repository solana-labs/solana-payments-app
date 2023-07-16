import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { LoadingDots } from '../LoadingDots';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pending?: boolean;
}

export const Secondary = forwardRef<HTMLButtonElement, Props>(function Secondary(props, ref) {
    const { pending, ...rest } = props;

    return (
        <button
            {...rest}
            ref={ref}
            className={twMerge(
                'bg-transparent',
                'border',
                'border-gray-300',
                'flex',
                'group',
                'h-10',
                'items-center',
                'justify-center',
                'px-4',
                'relative',
                'rounded-lg',
                'text-black',
                'tracking-normal',
                'transition-colors',
                rest.className,
                !pending && 'active:border-indigo-400',
                'disabled:bg-zinc-300',
                'disabled:cursor-not-allowed',
                !pending && 'hover:border-indigo-300',
                pending && 'cursor-not-allowed',
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
                    pending ? 'opacity-0' : 'opacity-100',
                )}
            >
                {rest.children}
            </div>
            {pending && <LoadingDots className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
        </button>
    );
});
