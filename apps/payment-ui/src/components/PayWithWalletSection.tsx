import BuyButton from "./BuyButton"
import WalletButton from "./WalletButton"

const PayWithWalletSection = () => {
    return (
        <div className="flex flex-col justify-end h-full">
            <div className="pb-4">
                <WalletButton />
            </div>
            <div className="pb-28">
                <BuyButton />
            </div>
        </div>
    )
}

export default PayWithWalletSection