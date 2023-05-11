import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

import { Info } from './icons/Info';

interface Props {
    className?: string;
}

export function WalletAddressSuggestion(props: Props) {
    return (
        <div className={twMerge('rounded-2xl', 'bg-slate-50', 'p-4', 'inline-block', props.className)}>
            <div className="flex items-center space-x-2.5">
                <Info className="fill-slate-900 h-5 w-5" />
                <div className="text-xs text-black font-medium pr-2.5">
                    Make sure this wallet address meets the following criteria:
                </div>
            </div>
            <div className="pl-8 mt-2 text-xs text-neutral-600">
                <div className="mb-2">
                    • A custodial or self-custodial wallet address
                    <br />• A Solana wallet address
                    <br />• A USDC account address
                </div>
                <Link className="font-semibold text-indigo-700" href="/support">
                    Need some help?
                </Link>
            </div>
        </div>
    );
}
