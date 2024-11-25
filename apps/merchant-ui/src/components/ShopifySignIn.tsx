import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
}

// TODO: Implement the sign in flow
export function ShopifySignIn(props: Props) {
    return (
        <button
            onClick={() => {
                switch (process.env.NEXT_PUBLIC_NODE_ENV) {
                    case 'development':
                        window.location.href = 'https://localhost:4004/install';
                        break;
                    case 'staging':
                        window.location.href = '/merchant';
                        break;
                    case 'production':
                        window.location.href = 'https://docs.hel.io/product-guides/solana-pay-shopify-plugin';
                        break;
                    default:
                        console.error('Unknown environment');
                        break;
                }
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
