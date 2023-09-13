import { twMerge } from 'tailwind-merge';

import { Info } from './icons/Info';

interface Props {
    className?: string;
}

export function WalletAddressSuggestion(props: Props) {
    return (
        <div className={twMerge('rounded-2xl', 'bg-slate-50', 'p-4', 'inline-block', props.className)}>
            <div className="flex items-center space-x-2.5">
                <Info className="fill-slate-900 h-5 w-5" />
                <p className="text-xs text-black font-medium pr-2.5">Ensure the address is one of the following:</p>
            </div>
            <div className="pl-8 mt-2 text-xs text-neutral-600">
                <div className="mb-2">
                    • A browser wallet (phantom)
                    <br />• A Solana public key
                    <br />• A custodial wallet address
                    <br />•{' '}
                    <a
                        className="font-semibold text-indigo-700"
                        href="https://commercedocs.solanapay.com/merchants/wallets/coinbase"
                    >
                        A Coinbase Solana USDC address
                    </a>
                    <br />• A USDC account address
                </div>
                <a
                    className="font-semibold text-indigo-700"
                    href="https://commercedocs.solanapay.com/merchants/onboarding"
                >
                    More Details
                </a>
            </div>
        </div>
    );
}
