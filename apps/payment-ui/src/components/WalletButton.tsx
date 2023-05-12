import React, { useEffect } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { AppDispatch } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPayerAccount } from '@/features/pay-tab/paySlice';

const WalletButton = () => {
    const { publicKey, sendTransaction } = useWallet();

    const walletDisplayString = (pubkey: web3.PublicKey | null) => {
        if (pubkey == null) {
            return 'Connect Wallet';
        }

        return pubkey.toBase58().slice(0, 4) + '...' + pubkey.toBase58().slice(pubkey.toBase58().length - 4);
    };

    return (
        <div className="dropdown dropdown-end w-full">
            <label tabIndex={0} className="btn btn-outline w-full justify-start text-black">
                {walletDisplayString(publicKey)}
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
                <li>
                    <a>Item 1</a>
                </li>
                <li>
                    <a>Item 2</a>
                </li>
            </ul>
        </div>
    );
};

export default WalletButton;
