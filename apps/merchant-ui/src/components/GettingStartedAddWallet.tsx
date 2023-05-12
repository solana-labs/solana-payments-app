import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

import { DefaultLayoutContent } from './DefaultLayoutContent';
import { BackButton } from './BackButton';
import { AddressInput } from './AddressInput';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';
import * as Button from './Button';

interface Props {
    className?: string;
}

export function GettingStartedAddWallet(props: Props) {
    const router = useRouter();

    return (
        <DefaultLayoutContent className={props.className}>
            <BackButton />
            <div className="font-semibold text-black text-2xl mt-14">Where would you like to receive payments?</div>
            <div
                className={twMerge(
                    'gap-x-4',
                    'grid-cols-[max-content,1fr]',
                    'grid',
                    'items-start',
                    'max-w-4xl',
                    'mt-9'
                )}
            >
                <div>
                    <div className="font-medium text-black text-sm">Settlement wallet</div>
                    <div className="text-sm text-neutral-600">Receive all payments to this address</div>
                    <WalletAddressSuggestion className="mt-5" />
                </div>
                <div className="flex justify-end">
                    <AddressInput className="w-full max-w-lg" />
                </div>
            </div>
            <div
                className={twMerge(
                    'border-gray-200',
                    'border-t',
                    'flex',
                    'items-center',
                    'justify-end',
                    'mt-6',
                    'py-5',
                    'space-x-3'
                )}
            >
                <Button.Secondary onClick={() => router.back()}>Cancel</Button.Secondary>
                <Button.Primary>Save</Button.Primary>
            </div>
        </DefaultLayoutContent>
    );
}
