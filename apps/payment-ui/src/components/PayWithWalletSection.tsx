import { Wallet } from './Wallet';

const PayWithWalletSection = () => {

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <Wallet />
            </div>
        </div>
    );
};

export default PayWithWalletSection;
