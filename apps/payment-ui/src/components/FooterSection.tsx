import { getPaymentMethod } from "@/features/payment-options/paymentOptionsSlice";
import { MergedState, getMergedState } from "@/features/payment-session/paymentSessionSlice";
import { useSelector } from "react-redux";
import PayWithWalletSection from "./PayWithWalletSection";
import CancelTransactionButton from "./CancelTransactionButton";
import SolanaPayErrorView from "./SolanaPayErrorView";

const FooterSection = () => {

    const paymentMethod = useSelector(getPaymentMethod)
    const mergedState = useSelector(getMergedState)

    if ( paymentMethod == 'connect-wallet' && mergedState == MergedState.start ) {
        return <PayWithWalletSection />
    } else if ( mergedState > MergedState.start && mergedState < MergedState.laggedCompleting ) {
        return <CancelTransactionButton />
    } else if ( paymentMethod == 'qr-code' && mergedState == MergedState.start ) {
        return <SolanaPayErrorView />
    } else {
        return (<div></div>)
    }
}

export default FooterSection;