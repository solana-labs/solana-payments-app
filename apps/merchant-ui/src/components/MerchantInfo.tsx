import { useToast } from '@/components/ui/use-toast';
import { isOk } from '@/lib/Result';
import { updateMerchantAddress, useMerchantStore } from '@/stores/merchantStore';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { AddressInput } from './AddressInput';
import * as Button from './Button';
import { DefaultLayoutContent } from './DefaultLayoutContent';
import { DefaultLayoutHeader } from './DefaultLayoutHeader';
import { DefaultLayoutScreenTitle } from './DefaultLayoutScreenTitle';
import { Input } from './Input';
import { Token, TokenSelect } from './TokenSelect';
import { WalletAddressSuggestion } from './WalletAddressSuggestion';

interface FormData {
    name: string;
    logoSrc?: string;
    walletAddress?: null | PublicKey;
    token: Token;
}

interface Props {
    className?: string;
}

export function MerchantInfo(props: Props) {
    const [formState, setFormState] = useState<FormData>({
        name: '',
        logoSrc: '',
        walletAddress: null,
        token: Token.USDC,
    });
    const [isVerified, setIsVerified] = useState(false);
    const [pending, setPending] = useState(false);

    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    const { toast } = useToast();

    useEffect(() => {
        if (isOk(merchantInfo)) {
            console.log('merchantInfo', merchantInfo);
            setFormState({
                name: merchantInfo.data.name,
                logoSrc: 'a',
                walletAddress: merchantInfo.data.paymentAddress
                    ? new PublicKey(merchantInfo.data.paymentAddress)
                    : null,
                token: Token.USDC,
            });
        }
    }, [merchantInfo]);

    function shouldDisable() {
        const { walletAddress } = formState;
        let paymentAddress = isOk(merchantInfo) && merchantInfo.data.paymentAddress;

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

    return (
        <DefaultLayoutContent className={props.className}>
            <DefaultLayoutScreenTitle>Merchant Info</DefaultLayoutScreenTitle>
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
                <DefaultLayoutHeader className="mt-24 col-span-2">Information</DefaultLayoutHeader>
                <div>
                    <div className="font-medium text-black text-sm">Merchant Name</div>
                    <div className="text-sm text-neutral-600">Taken from your Shopify store</div>
                </div>
                <div className="flex justify-end">
                    <Input disabled className="w-full max-w-lg" value={formState.name} />
                </div>
                <div className="mt-6 border-b border-gray-200 col-span-2" />
                <DefaultLayoutHeader className="mt-24 col-span-2">Wallet and Settlement</DefaultLayoutHeader>
                <div>
                    <div className="font-medium text-black text-sm">USDC Payments Address</div>
                    <div className="text-sm text-neutral-600">Receive all payments to this address</div>
                    <WalletAddressSuggestion className="mt-5" />
                </div>
                <div className="flex justify-end">
                    <AddressInput
                        className="w-full max-w-lg"
                        onChange={wallet =>
                            setFormState(cur => ({
                                ...cur,
                                walletAddress: wallet ? new PublicKey(wallet) : null,
                            }))
                        }
                        defaultValue={formState.walletAddress}
                    />
                </div>
                <div className="my-6 border-b border-gray-200 col-span-2" />
                <div>
                    <div className="font-medium text-black text-sm">Settlement Token</div>
                    <div className="text-sm text-neutral-600">Select which token you receive from customers</div>
                </div>
                <div>
                    <TokenSelect
                        disabled
                        className="w-full"
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
                    onClick={() => {
                        setPending(true);
                        updateMerchantAddress(formState.walletAddress?.toString());
                        toast({
                            title: 'Updated Merchant Address',
                        });
                        setPending(false);
                    }}
                    pending={pending}
                    disabled={shouldDisable()}
                >
                    Save
                </Button.Primary>
            </footer>
        </DefaultLayoutContent>
    );
}
