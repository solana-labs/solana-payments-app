import React, { useEffect } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { WalletDisconnectButton } from './WalletDisconnectButton';
import { WalletCopyButton } from './WalletCopyButton';
import Image from 'next/image';
import { getBalance } from '@/features/wallet/walletSlice';

const WalletButton = () => {
    const { publicKey, sendTransaction } = useWallet();

    const usdcBalance = useSelector(getBalance);

    const walletDisplayString = (pubkey: web3.PublicKey | null) => {
        if (pubkey == null) {
            return 'Connect Wallet';
        }

        return pubkey.toBase58().slice(0, 4) + '...' + pubkey.toBase58().slice(pubkey.toBase58().length - 4);
    };

    return (
        <div className="w-full">
            <label
                tabIndex={0}
                className="btn border-2 border-black outline-none bg-white w-full justify-start text-black hover:bg-white"
                htmlFor="wallet_modal"
            >
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center justify-between">
                        <Image className="mr-2" src="/electric_bolt.svg" alt="Electric Bolt" width={15} height={15} />
                        <div className="normal-case text-black text-md">{walletDisplayString(publicKey)}</div>
                    </div>
                    <Image className="mr-2" src="/expand.svg" alt="Electric Bolt" width={15} height={15} />
                </div>
            </label>
            <input type="checkbox" id="wallet_modal" className="modal-toggle" />
            <div id="wallet_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white h-96">
                    <div className="flex flex-col h-full relative z-0">
                        <div className="z-0 flex flex-row items-end justify-center h-full relative">
                            <div className="flex flex-col items-center justify-center h-full">
                                <Image
                                    className=""
                                    src="/connected-icon.svg"
                                    alt="Wallet Connected Icon"
                                    width={56}
                                    height={56}
                                />
                                <div className="pt-5 text-black text-3xl font-medium">
                                    {walletDisplayString(publicKey)}
                                </div>
                                <div className="pt-2 text-gray-700 text-md font-normal">{usdcBalance}</div>
                            </div>
                        </div>
                        <div className="z-10 flex flex-row items-end justify-end h-full relative">
                            <div className="w-1/2 pr-2">
                                <WalletDisconnectButton />
                            </div>
                            <div className="w-1/2 pl-4">
                                <WalletCopyButton />
                            </div>
                        </div>
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
