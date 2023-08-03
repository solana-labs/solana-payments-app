import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { getBalance, getCustomerNfts, getPointsBalance, getTier } from '@/features/customer/customerSlice';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { MdContentCopy, MdLogout } from 'react-icons/md';
import { useSelector } from 'react-redux';

interface Props {
    className?: string;
}

export function CustomerProfile(props: Props) {
    const { publicKey, disconnect } = useWallet();

    const usdcBalance = useSelector(getBalance);
    const pointsBalance = useSelector(getPointsBalance);
    const customerTier = useSelector(getTier);
    const customerNfts = useSelector(getCustomerNfts);
    const [copied, setCopied] = useState(false);

    const walletDisplayString = (pubkey: web3.PublicKey | null) => {
        if (pubkey == null) {
            return 'Connect Wallet';
        }

        return pubkey.toBase58().slice(0, 4) + '...' + pubkey.toBase58().slice(pubkey.toBase58().length - 4);
    };

    const copyAddress = useCallback(async () => {
        if (publicKey) {
            await navigator.clipboard.writeText(publicKey.toBase58());
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    }, [publicKey]);

    return (
        <Dialog>
            <DialogTrigger className="w-full">
                <Button variant="outline" className="w-full flex flex-row justify-between px-4 py-5">
                    <div className="flex flex-row">
                        <Image className="mr-2" src="/electric_bolt.svg" alt="Electric Bolt" width={15} height={15} />
                        <p className="text-black">{walletDisplayString(publicKey)}</p>
                    </div>
                    <Image className="mr-2" src="/expand.svg" alt="Electric Bolt" width={15} height={15} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className="pt-20">
                    <div className="flex flex-col items-center justify-center h-full text-black">
                        <Image src="/connected-icon.svg" alt="Wallet Connected Icon" width={56} height={56} />
                        <DialogTitle className="pt-5 text-3xl font-medium">
                            {walletDisplayString(publicKey)}
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-gray-700 text-md font-normal">
                            {usdcBalance} USDC
                        </DialogDescription>
                        <DialogDescription className="pt-2 text-gray-700 text-md font-normal">
                            {pointsBalance} Points
                        </DialogDescription>
                        {customerTier && (
                            <DialogDescription className="pt-2 text-gray-700 text-md font-normal">
                                {customerTier.name}
                            </DialogDescription>
                        )}
                        {customerNfts && (
                            <DialogDescription className="pt-2 text-gray-700 text-md font-normal text-center">
                                <div>
                                    <div className="flex flex-row ">
                                        {customerNfts.map(product => (
                                            <Image
                                                key={product.id}
                                                src={product.image}
                                                alt={product.name}
                                                width={50}
                                                height={50}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </DialogDescription>
                        )}
                    </div>
                </DialogHeader>
                <DialogFooter className="pt-12 pb-6">
                    <Button
                        variant="outline"
                        onClick={disconnect}
                        className="w-1/2 border-2 border-black text-lg text-black p-6"
                    >
                        <MdLogout width={22} height={22} />
                        <span className="pl-2 ">Disconnect</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={copyAddress}
                        className="w-1/2 border-2 border-black text-lg text-black p-6"
                    >
                        <MdContentCopy width={22} height={22} />
                        <span className="pl-2 ">{copied ? 'Copied' : 'Copy address'}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
