import { useSelector } from "react-redux";
import { ErrorGoBack } from "./ErrorGoBack"
import { getPaymentDetails } from "@/features/payment-session/paymentSessionSlice";

export const PaymentLoadingView = () => {

    return (
        <div className="flex flex-col w-full items-center justify-center">
            <span className="loading loading-spinner w-12 my-8"></span>
            <div>Processing transaction...</div>
        </div>
    )
}