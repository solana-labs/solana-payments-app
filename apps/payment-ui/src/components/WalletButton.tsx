import React, { useEffect } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPayerAccount } from '@/features/pay-tab/paySlice';
import { WalletDisconnectButton } from './WalletDisconnectButton';
import { WalletCopyButton } from './WalletCopyButton';

const WalletButton = () => {
    const { publicKey, sendTransaction } = useWallet();

    const walletDisplayString = (pubkey: web3.PublicKey | null) => {
        if (pubkey == null) {
            return 'Connect Wallet';
        }

        return pubkey.toBase58().slice(0, 4) + '...' + pubkey.toBase58().slice(pubkey.toBase58().length - 4);
    };

    return (
        <div className="w-full">
            <label tabIndex={0} className="btn btn-outline w-full justify-start text-black" htmlFor="wallet_modal">
                {walletDisplayString(publicKey)}
            </label>
            <input type="checkbox" id="wallet_modal" className="modal-toggle" />
            <div id="wallet_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white h-80">
                    <div className='z-0 flex flex-row items-end justify-end h-full'>
                        <div className='w-1/2 pr-2'>
                            <WalletDisconnectButton />
                        </div>
                        <div className='w-1/2 pl-4'>
                            <WalletCopyButton />
                        </div>
                    </div>
                </div>
                <label className="modal-backdrop" htmlFor="wallet_modal">Close</label>
            </div>
        </div>
    );
};

export default WalletButton;
