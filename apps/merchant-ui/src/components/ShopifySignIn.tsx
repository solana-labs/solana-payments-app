import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

export function ShopifySignIn(props: Props) {
    return (
        <>
            {' '}
            <button
                className={twMerge(
                    'border-gray-300',
                    'border',
                    'font-semibold',
                    'h-11',
                    'rounded-lg',
                    'text-slate-700',
                    props.className
                )}
            >
                Sign in with Shopify
            </button>
            <button
                className={twMerge(
                    'border-gray-300',
                    'border',
                    'font-semibold',
                    'h-11',
                    'rounded-lg',
                    'text-slate-700',
                    props.className
                )}
            >
                Sign in Temporary
            </button>
        </>
    );
}
