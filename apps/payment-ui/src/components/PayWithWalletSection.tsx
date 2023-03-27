import BuyButton from "./BuyButton"
import { Wallet } from "./Wallet"
import WalletButton from "./WalletButton"

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

const PayWithWalletSection = () => {

    const { publicKey, sendTransaction } = useWallet();

    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <Wallet />
            </div>
            <div className="pb-28">
                <BuyButton />
            </div>
        </div>
    )
}

export default PayWithWalletSection