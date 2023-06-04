import { Wallet } from './Wallet';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import WalletSection from './WalletSection';

const PayWithWalletSection = () => {
    const { publicKey, sendTransaction } = useWallet();

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <Wallet />
                {/* <WalletSection /> */}
            </div>
        </div>
    );
};

export default PayWithWalletSection;
