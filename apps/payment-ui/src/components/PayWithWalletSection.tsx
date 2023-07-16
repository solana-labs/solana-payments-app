import Wallet from './Wallet';
import dynamic from 'next/dynamic';

const PayWithWalletSection = () => {
    const DynamicWallet = dynamic(() => import('./Wallet'), { ssr: false });

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <DynamicWallet />
            </div>
        </div>
    );
};

export default PayWithWalletSection;
