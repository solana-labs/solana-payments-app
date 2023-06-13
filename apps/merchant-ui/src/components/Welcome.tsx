import WarningAlt from '@carbon/icons-react/lib/WarningAlt';
import { ShopifySignIn } from './ShopifySignIn';
import { SolanaPayMark } from './SolanaPayMark';

interface Props {
    className?: string;
    isBlocked: boolean;
}

export function Welcome(props: Props) {
    return (
        <article className={props.className}>
            <SolanaPayMark className="h-8 md:h-14 mb-10 md:mb-14" />
            <h1 className="text-black font-semibold text-2xl md:text-3xl mt-6">
                Welcome to the Solana Pay Merchant Portal
            </h1>
            <p className="mt-3 text-neutral-600">
                Solana Pay makes it easy for you to accept Solana and USDC payments on your Shopify site.
            </p>
            {props.isBlocked ? (
                <ShopifySignIn className="mt-10 w-full max-w-md" />
            ) : (
                <div className="border border-orange-500 bg-orange-50 text-orange-800 rounded-lg p-4 flex flex-row items-center space-x-2">
                    <WarningAlt size={20} />
                    <p>Solana Pay is not available in your current location</p>
                </div>
            )}
        </article>
    );
}
