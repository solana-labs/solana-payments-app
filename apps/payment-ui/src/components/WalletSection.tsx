import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletMultiButton } from './WalletMultiButton';
import { clusterApiUrl } from '@solana/web3.js';
import WalletButton from './WalletButton';
import BuyButton from './BuyButton';
import Image from 'next/image';
import { ErrorView } from './ErrorView';
import { getError } from '@/features/error/errorSlice';
import { useSelector } from 'react-redux';


const WalletSection = () => {

    const { publicKey, wallet, disconnect } = useWallet();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const error = useSelector(getError)

    return (
        <div>
            { !wallet && !base58 ? 
                (
                    <WalletMultiButton style={{ backgroundColor: 'black', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className='flex flex-row items-center justify-center'>
                            <Image className='pr-1' src="/electric_bolt_white.svg" alt="Solana Pay Logo" width={15} height={15} />
                            <div className='pl-1'>Connect wallet</div>
                        </div>
                    </ WalletMultiButton>
                ) 
                : 
                (
                    <div className=''>
                        <div className='pb-4'>
                            { error ? <ErrorView /> : <div></div> }
                        </div>
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