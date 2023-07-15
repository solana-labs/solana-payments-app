import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

// TODO: Implement the sign in flow
export function ShopifySignIn(props: Props) {
    return (
        <button
            onClick={() => {
                process.env.NODE_ENV === 'development'
                    ? (window.location.href = 'https://localhost:4004/install')
                    : (window.location.href = '/merchant');
            }}
            className={twMerge(
                'border-gray-300',
                'border',
                'font-semibold',
                'h-11',
                'rounded-lg',
                'text-slate-700',
                'flex',
                'flex-row',
                'items-center',
                'justify-center',
                'space-x-2',
                props.className
            )}
        >
            <img className="h-7 w-7" src="/shopify-logo.svg" alt="Shopify Logo" />
            <p>Sign in with Shopify</p>
        </button>
    );
}
