import * as RE from '@/lib/Result';
import { updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AddressInput } from './AddressInput';
import { BackButton } from './BackButton';
import * as Button from './Button';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';

interface Props {
    className?: string;
}

export function GettingStartedAddWallet(props: Props) {
    const router = useRouter();

    const [walletAddress, setWalletAddress] = useState<null | PublicKey>(null);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);
    const [addressChanged, setAddressChanged] = useState<boolean | string | null>(null);
    const [pending, setPending] = useState(false);
    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    function shouldDisable(): boolean {
        let paymentAddress = RE.isOk(merchantInfo) && merchantInfo.data.paymentAddress;
        if (!walletAddress || walletAddress.toString() === paymentAddress) {
            return true;
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
        let response = await updateMerchant('paymentAddress', walletAddress.toString());
        if (response && response.status === 200) {
            setAddressChanged(true);
            await getMerchantInfo();
            setPending(false);
            router.push('/getting-started');
        } else if (response && response.status !== 200) {
            await getMerchantInfo();
            setPending(false);
            setAddressChanged(response?.statusText);
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
                    'mt-9'
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
                        onChange={wallet => setWalletAddress(wallet ? new PublicKey(wallet) : null)}
                        defaultValue={walletAddress}
                        addressChanged={addressChanged}
                        setAddressChanged={setAddressChanged}
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
                <Button.Primary onClick={handleMerchantAddressClick} pending={pending} disabled={shouldDisable()}>
                    Save
                </Button.Primary>
            </div>
        </DefaultLayoutContent>
    );
}
