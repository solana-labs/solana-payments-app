import * as Button from '@/components/Button';
import * as RE from '@/lib/Result';
import { updateMerchant, useMerchantStore } from '@/stores/merchantStore';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AddressInput } from './AddressInput';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutHeader } from './DefaultLayoutHeader';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { Input } from './Input';
import { Token, TokenSelect } from './TokenSelect';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';

interface FormData {
    name: string;
    logoSrc: string;
    walletAddress: string;
    token: Token;
}

interface Props {
    className?: string;
}

export function MerchantInfo(props: Props) {
    const [formState, setFormState] = useState<FormData>({
        name: '',
        logoSrc: '',
        walletAddress: '',
        token: Token.USDC,
    });
    const [pending, setPending] = useState(false);
    const [addressChanged, setAddressChanged] = useState<boolean | string | null>(null);
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    const getMerchantInfo = useMerchantStore(state => state.getMerchantInfo);

    useEffect(() => {
        if (RE.isOk(merchantInfo)) {
            setFormState({
                name: merchantInfo.data.name,
                logoSrc: 'a',
                walletAddress: merchantInfo.data.paymentAddress ? merchantInfo.data.paymentAddress : '',
                token: Token.USDC,
            });
        }
    }, [merchantInfo]);

    function notChanged() {
        if (!RE.isOk(merchantInfo)) {
            return false;
        }

        return formState.walletAddress.toString() === merchantInfo.data.paymentAddress;
    }

    function shouldDisable() {
        if (!RE.isOk(merchantInfo)) {
            return false;
        }
        try {
            new PublicKey(formState.walletAddress);
            return false;
        } catch {
            return true;
        }
    }

    async function handleMerchantAddressClick() {
        if (!formState.walletAddress) {
            return;
        }
        setPending(true);

        let response = await updateMerchant('paymentAddress', formState.walletAddress);

        if (response && response.status === 200) {
            setAddressChanged(true);
        } else if (response && response.status !== 200) {
            let d = await response.json();
            setAddressChanged(d.error);
        }

        await getMerchantInfo();
        setPending(false);
    }

    if (RE.isFailed(merchantInfo)) {
        return (
            <DefaultLayoutContent className={props.className}>
                <div className="flex flex-col justify-center h-full ">
                    <div className="mt-4 text-center">
                        <h1 className="text-2xl font-semibold">This Merchant does not exist</h1>
                        <p className="text-lg  mt-2">Please Log in with a different Merchant account</p>
                    </div>
                </div>
            </DefaultLayoutContent>
        );
    }

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Merchant Info</DefaultLayoutScreenTitle>
            <div className={twMerge('gap-x-4', 'grid-cols-[max-content,1fr]', 'grid', 'items-start', 'max-w-4xl')}>
                <DefaultLayoutHeader className="mt-16 col-span-2">Information</DefaultLayoutHeader>
                <div>
                    <p className="font-medium text-black text-sm">Merchant Name</p>
                    <p className="text-sm text-neutral-600">Taken from your Shopify store</p>
                </div>
                <div className="flex justify-end">
                    <Input disabled className="w-full max-w-lg" value={formState.name} />
                </div>
                <div className="mt-6 border-b border-gray-200 col-span-2" />
                <DefaultLayoutHeader className="mt-16 col-span-2">Wallet and Settlement</DefaultLayoutHeader>
                <div className="flex flex-col space-y-2">
                    <p className="font-medium text-black text-sm">USDC Payments Address</p>
                    <WalletAddressSuggestion />
                </div>
                <div className="flex justify-end">
                    <AddressInput
                        className="w-full max-w-lg"
                        value={formState.walletAddress}
                        onChange={wallet =>
                            setFormState(cur => ({
                                ...cur,
                                walletAddress: wallet,
                            }))
                        }
                        addressChanged={addressChanged}
                        setAddressChanged={setAddressChanged}
                        addressIsInvalid={shouldDisable()}
                    />
                </div>
                <div className="my-6 border-b border-gray-200 col-span-2" />
                <div>
                    <p className="font-medium text-black text-sm">Settlement Token</p>
                    <p className="text-sm text-neutral-600">Select which token you receive from customers</p>
                </div>
                <div className="flex justify-end">
                    <TokenSelect
                        disabled
                        className="w-full max-w-lg"
                        token={formState.token}
                        onChange={token =>
                            setFormState(cur => ({
                                ...cur,
                                token,
                            }))
                        }
                    />
                </div>
                <div className="my-6 border-b border-gray-200 col-span-2" />
            </div>
            <footer className="flex items-center justify-end space-x-3 pt-4">
                <Button.Secondary>Cancel</Button.Secondary>
                <Button.Primary
                    onClick={handleMerchantAddressClick}
                    pending={pending}
                    disabled={notChanged() || shouldDisable()}
                >
                    Save
                </Button.Primary>
            </footer>
        </DefaultLayoutContent>
    );
}
