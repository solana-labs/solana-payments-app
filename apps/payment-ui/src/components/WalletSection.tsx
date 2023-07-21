import BuyButton from '@/components/BuyButton';
import { CustomerProfile } from '@/components/CustomerProfile';
import SimpleNotificationView from '@/components/SimpleNotificationView';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletSection = () => {
    const { connected } = useWallet();

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
                        <CustomerProfile />
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
