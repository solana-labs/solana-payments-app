import { Button } from '@/components/ui/button';
import { getBalance } from '@/features/wallet/walletSlice';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { MdContentCopy, MdLogout } from 'react-icons/md';
import { useSelector } from 'react-redux';

const WalletButton = () => {
    const { publicKey, disconnect } = useWallet();

    const usdcBalance = useSelector(getBalance);
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
        <div className="w-full">
            <label
                tabIndex={0}
                className="btn border-2 border-black outline-none bg-white w-full justify-start hover:bg-white"
                htmlFor="wallet_modal"
            >
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center justify-between">
                        <Image className="mr-2" src="/electric_bolt.svg" alt="Electric Bolt" width={15} height={15} />
                        <div className="normal-case text-md">{walletDisplayString(publicKey)}</div>
                    </div>
                    <Image className="mr-2" src="/expand.svg" alt="Electric Bolt" width={15} height={15} />
                </div>
            </label>
            <input type="checkbox" id="wallet_modal" className="modal-toggle" />
            <div id="wallet_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white h-96 flex flex-col relative z-0">
                    <div className="flex flex-col items-center justify-center h-full text-black">
                        <Image src="/connected-icon.svg" alt="Wallet Connected Icon" width={56} height={56} />
                        <div className="pt-5 text-3xl font-medium">{walletDisplayString(publicKey)}</div>
                        <div className="pt-2 text-gray-700 text-md font-normal">{usdcBalance}</div>
                    </div>

                    <div className="flex items-end justify-end h-full space-x-2">
                        <Button
                            variant="outline"
                            onClick={disconnect}
                            className="w-1/2 border-2 border-black text-lg text-black"
                        >
                            <MdLogout width={22} height={22} />
                            <span className="pl-2 ">Disconnect</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={copyAddress}
                            className="w-1/2 border-2 border-black text-lg text-black"
                        >
                            <MdContentCopy width={22} height={22} />
                            <span className="pl-2 ">{copied ? 'Copied' : 'Copy address'}</span>
                        </Button>
                    </div>
                </div>
                <label className="modal-backdrop" htmlFor="wallet_modal">
                    Close
                </label>
            </div>
        </div>
    );
};

export default WalletButton;
