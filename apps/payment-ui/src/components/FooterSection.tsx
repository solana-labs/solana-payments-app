import { getPaymentMethod } from "@/features/payment-options/paymentOptionsSlice";
import { MergedState, getMergedState } from "@/features/payment-session/paymentSessionSlice";
import { useSelector } from "react-redux";
import PayWithWalletSection from "./PayWithWalletSection";
import CancelTransactionButton from "./CancelTransactionButton";
import SolanaPayErrorView from "./SolanaPayErrorView";
import { getIsSolanaPayNotification } from "@/features/notification/notificationSlice";

const FooterSection = () => {

    const paymentMethod = useSelector(getPaymentMethod)
    const mergedState = useSelector(getMergedState)
    const isSolanaPayNotification = useSelector(getIsSolanaPayNotification)

    if ( paymentMethod == 'connect-wallet' && mergedState == MergedState.start ) {
        return <PayWithWalletSection />
    } else if ( paymentMethod == 'qr-code' && isSolanaPayNotification ) {
        return <SolanaPayErrorView />
    } else if ( mergedState > MergedState.start && mergedState < MergedState.completed ) {
        return <CancelTransactionButton />
    }  else {
        return (<div></div>)
    }
}

export default FooterSection;