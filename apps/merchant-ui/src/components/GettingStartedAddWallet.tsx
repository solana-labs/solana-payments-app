import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/router';

import { DefaultLayoutContent } from './DefaultLayoutContent';
import { BackButton } from './BackButton';
import { AddressInput } from './AddressInput';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';
import * as Button from './Button';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/lib/endpoints';
import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import { updateMerchantAddress } from '@/hooks/useMerchant';
import { set } from 'date-fns';

interface Props {
    className?: string;
}

export function GettingStartedAddWallet(props: Props) {
    const router = useRouter();

    const [walletAddress, setWalletAddress] = useState<null | PublicKey>(null);

    const [pending, setPending] = useState(false);

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
                    {/* <AddressInput className="w-full max-w-lg" /> */}
                    <AddressInput
                        className="w-full max-w-lg"
                        onChange={wallet => setWalletAddress(wallet ? new PublicKey(wallet) : null)}
                        defaultValue={walletAddress}
                    />
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
                <Button.Primary
                    onClick={() => {
                        setPending(true);
                        updateMerchantAddress(walletAddress?.toString());
                        router.push('/getting-started');
                        setPending(false);
                    }}
                    pending={pending}
                >
                    Save
                </Button.Primary>
            </div>
        </DefaultLayoutContent>
    );
}
