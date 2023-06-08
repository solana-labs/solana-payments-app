import { useSelector } from "react-redux";
import { ErrorGoBack } from "./ErrorGoBack"
<<<<<<< HEAD
import { getPaymentDetails } from "@/features/payment-session/paymentSessionSlice";
=======
import { getPaymentDetails } from "@/features/pay-tab/paySlice";
>>>>>>> e9c2b24 (merging in recent changes to demo (#244))

export const GeoBlockedView = () => {

    const paymentDetails = useSelector(getPaymentDetails);

    return (
        <ErrorGoBack top={"Blocked"} bottom={"Nice try kid."} redirect={paymentDetails?.cancelUrl ?? null} />
    )
}