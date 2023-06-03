import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

// TODO: Implement the sign in flow
export function ShopifySignIn(props: Props) {
    return (
        <button
            onClick={() => {
                window.location.href = 'https://localhost:4004/install'
            }}
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
    );
}
