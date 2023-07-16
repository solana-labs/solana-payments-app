import * as Button from '@/components/Button';
import { updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AddressInput } from './AddressInput';
import { BackButton } from './BackButton';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';

interface Props {
    className?: string;
}

export function GettingStartedAddWallet(props: Props) {
    const router = useRouter();

    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    const [walletAddress, setWalletAddress] = useState<string>('');
    const [addressChanged, setAddressChanged] = useState<boolean | string | null>(null);
    const [pending, setPending] = useState(false);

    function shouldDisable(): boolean {
        if (walletAddress === '') {
            return false;
        }
        try {
            new PublicKey(walletAddress);
        } catch {
            return true;
        }
        return false;
    }

    async function handleMerchantAddressClick() {
        if (!walletAddress) {
            return;
        }

        setPending(true);
        let response = await updateMerchant('paymentAddress', walletAddress);
        if (response && response.status === 200) {
            setAddressChanged(true);
            await getMerchantInfo();
            setPending(false);
            router.push('/getting-started');
        } else if (response && response.status !== 200) {
            let d = await response.json();
            setAddressChanged(d.error);
            setPending(false);
        }
    }

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
                    'mt-9',
                )}
            >
                <div>
                    <div className="font-medium text-black text-sm">Settlement wallet</div>
                    <div className="text-sm text-neutral-600">Receive all payments to this address</div>
                    <WalletAddressSuggestion className="mt-5" />
                </div>
                <div className="flex justify-end">
                    <AddressInput
                        className="w-full max-w-lg"
                        value={walletAddress}
                        onChange={wallet => setWalletAddress(wallet)}
                        addressChanged={addressChanged}
                        setAddressChanged={setAddressChanged}
                        addressIsInvalid={shouldDisable()}
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
                    'space-x-3',
                )}
            >
                <Button.Secondary onClick={() => router.back()}>Cancel</Button.Secondary>
                <Button.Primary
                    onClick={handleMerchantAddressClick}
                    pending={pending}
                    disabled={walletAddress === '' || shouldDisable()}
                >
                    Save
                </Button.Primary>
            </div>
        </DefaultLayoutContent>
    );
}
