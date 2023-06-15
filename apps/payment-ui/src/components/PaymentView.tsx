import { PayToLabel } from "@/components/PayToLabel";
import { PaymentMethodTab } from "@/components/PaymentMethodTab";
import { useSelector } from "react-redux";
import PayWithWalletSection from "./PayWithWalletSection";
import PayWithQRCodeSection from "./PayWithQRCodeSection";
import { getPaymentMethod } from "@/features/payment-options/paymentOptionsSlice";

export const PaymentView = () => {

    return (
        <div className='flex flex-col justify-between h-full'>
            <div className="w-full flex flex-col pt-16 relative">
                <div className="relative pb-8 flex-col hidden sm:flex">
                    <PaymentMethodTab />
                </div>
                <PayToLabel />
            </div>
        </div>
    )
}