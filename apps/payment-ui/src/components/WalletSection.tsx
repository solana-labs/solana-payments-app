import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletMultiButton } from './WalletMultiButton';
import { clusterApiUrl } from '@solana/web3.js';
import WalletButton from './WalletButton';
import BuyButton from './BuyButton';

const WalletSection = () => {

    const { publicKey, wallet, disconnect } = useWallet();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);


    return (
        <div>
            { !wallet && !base58 ? 
                (
                    <WalletMultiButton style={{ backgroundColor: 'black', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        Connect wallet
                    </ WalletMultiButton>
                ) 
                : 
                (
                    <div className=''>
                        <div className='pb-2'>
                            <WalletButton />
                        </div>
                        <div className='pt-2'>
                            <BuyButton /> 
                        </div>
                    </div>
                    
                )
                
            }
        </div>
    )
}

export default WalletSection