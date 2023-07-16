import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useMemo } from 'react';
// import { WalletMultiButton } from './WalletMultiButton';
import { setWalletConnected } from '@/features/wallet/walletSlice';
import { AppDispatch } from '@/store';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import BuyButton from './BuyButton';
import SimpleNotificationView from './SimpleNotificationView';
import WalletButton from './WalletButton';

const WalletSection = () => {
    const { publicKey, wallet, disconnect } = useWallet();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (base58) {
            dispatch(setWalletConnected(base58));
        }
    }, [dispatch, base58]);

    return (
        <div>
            {!base58 ? (
                <WalletMultiButton
                    style={{
                        backgroundColor: 'black',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div className="flex flex-row items-center justify-center">
                        <Image
                            className="pr-1"
                            src="/electric_bolt_white.svg"
                            alt="Solana Pay Logo"
                            width={15}
                            height={15}
                        />
                        <div className="pl-1">Connect wallet</div>
                    </div>
                </WalletMultiButton>
            ) : (
                <div className="">
                    <div className="pb-4">
                        <SimpleNotificationView />
                    </div>
                    <div className="pb-2">
                        <WalletButton />
                    </div>
                    <div className="pt-2">
                        <BuyButton />
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletSection;
