import { PayToLabel } from "@/features/pay-tab/PayToLabel";
import { PaymentMethodTab } from "@/features/pay-tab/PaymentMethodTab";
import { getPaymentMethod } from "@/features/pay-tab/paySlice";
import { useSelector } from "react-redux";
import PayWithWalletSection from "./PayWithWalletSection";
import PayWithQRCodeSection from "./PayWithQRCodeSection";

export const PaymentView = () => {

    const paymentMethod = useSelector(getPaymentMethod);

    return (
        <div className='flex flex-col justify-between h-full'>
            <div className="w-full flex flex-col pt-16">
                <div className="relative pb-8 flex-col hidden sm:flex">
                    <PaymentMethodTab />
                </div>
                <div className="relative flex flex-col">
                    <PayToLabel />
                </div>
            </div>
            <div className="relative flex flex-col h-full">
                {paymentMethod == 'connect-wallet' ? <PayWithWalletSection /> : <PayWithQRCodeSection />}
            </div>
        </div>
    )
}