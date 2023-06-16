import React, { FC, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { WalletMultiButton } from './WalletMultiButton';
import { clusterApiUrl } from '@solana/web3.js';
import WalletButton from './WalletButton';
import BuyButton from './BuyButton';
import Image from 'next/image';
import { getIsNotification } from '@/features/notification/notificationSlice';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationView } from './NotificationView';
import { AppDispatch } from '@/store';
import { setWalletConnected } from '@/features/wallet/walletSlice';


const WalletSection = () => {

    const { publicKey, wallet, disconnect } = useWallet();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);
    const isNotification = useSelector(getIsNotification)

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {

        if (base58) {
            dispatch(setWalletConnected(base58))
        }

    }, [dispatch, base58]);

    return (
        <div>
            { !base58 ? 
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
                            { isNotification ? <NotificationView /> : null }
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