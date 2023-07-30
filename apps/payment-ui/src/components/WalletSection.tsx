import BuyButton from '@/components/BuyButton';
import { CustomerProfile } from '@/components/CustomerProfile';
import SimpleNotificationView from '@/components/SimpleNotificationView';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletSection = () => {
    const { connected } = useWallet();

    return (
        <div className="flex flex-col justify-end h-full items-center w-full">
            {!connected ? (
                <div className="w-full">
                    <WalletMultiButton>
                        <div className="flex flex-row items-center justify-center">
                            <div className="pl-1">Connect wallet</div>
                        </div>
                    </WalletMultiButton>
                </div>
            ) : (
                <div className="w-full flex flex-col space-y-2">
                    <SimpleNotificationView />
                    <CustomerProfile />
                    <BuyButton />
                </div>
            )}
        </div>
    );
};

export default WalletSection;
