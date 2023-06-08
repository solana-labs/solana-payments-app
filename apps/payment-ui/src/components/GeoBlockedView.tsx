import { useSelector } from "react-redux";
import { ErrorGoBack } from "./ErrorGoBack"
import { getPaymentDetails } from "@/features/pay-tab/paySlice";

export const GeoBlockedView = () => {

    const paymentDetails = useSelector(getPaymentDetails);

    return (
        <ErrorGoBack top={"Blocked"} bottom={"Nice try kid."} redirect={paymentDetails?.cancelUrl ?? null} />
    )
}