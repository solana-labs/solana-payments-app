import dynamic from 'next/dynamic';
import { FC } from 'react';

const PayWithWalletSection: FC = () => {
    const DynamicWallet = dynamic(() => import('./Wallet'), { ssr: false }) as FC;

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <DynamicWallet />
            </div>
        </div>
    );
};

export default PayWithWalletSection;
