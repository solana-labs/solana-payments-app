import BuyButton from '@/components/BuyButton';
import SimpleNotificationView from '@/components/SimpleNotificationView';
import WalletButton from '@/components/WalletButton';
import { setWalletConnected } from '@/features/wallet/walletSlice';
import { AppDispatch } from '@/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const WalletSection = () => {
    const { publicKey, wallet, disconnect, connected } = useWallet();

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (publicKey) {
            dispatch(setWalletConnected(publicKey.toBase58()));
        }
    }, [dispatch, publicKey]);

    return (
        <div className="flex flex-col justify-end h-full pb-4 py-2">
            {!connected ? (
                <WalletMultiButton
                    style={{
                        backgroundColor: 'black',
                        width: '400',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 100,
                    }}
                >
                    <div className="flex flex-row items-center justify-center">
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
