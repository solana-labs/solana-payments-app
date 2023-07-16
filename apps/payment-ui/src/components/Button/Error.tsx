import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pending?: boolean;
}

export const Error = forwardRef<HTMLButtonElement, Props>(function Error(props, ref) {
    const { pending, ...rest } = props;

    return (
        <button
            {...rest}
            ref={ref}
            className={twMerge(
                'bg-red-100',
                'border',
                'border-red-900',
                'flex',
                'group',
                'h-10',
                'items-center',
                'justify-between',
                'px-4',
                'relative',
                'rounded-lg',
                'text-red-900',
                'tracking-normal',
                'transition-colors',
                rest.className,
                !pending && 'active:border-indigo-400',
                'disabled:bg-zinc-300',
                'disabled:cursor-not-allowed',
                !pending && 'hover:border-red-100',
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
                    'justify-between',
                    'text-current',
                    'text-sm',
                    'transition-all',
                    'group-disabled:text-neutral-400',
                    pending ? 'opacity-0' : 'opacity-100',
                )}
            >
                {rest.children}
            </div>
            {pending && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 loading loading-spinner loading-sm " />
            )}
            {/* {pending && <LoadingDots className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />} */}
        </button>
    );
});
