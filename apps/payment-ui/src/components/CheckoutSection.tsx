import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import {
    MergedState,
    getIsCompleted,
    getIsError,
    getIsProcessing,
    getIsSolanaPayCompleted,
    getMergedState,
} from '@/features/payment-session/paymentSessionSlice';
import { BlockedProps } from '@/pages';
import { useSelector } from 'react-redux';
import { ErrorView } from './ErrorView';
import { GeoBlockedView } from './GeoBlockedView';
import { PaymentLoadingView } from './PaymentLoadingView';
import { PaymentView } from './PaymentView';
import { ThankYouView } from './ThankYou';
import CancelledTransactionView from './CancelledTransactionView';

const CheckoutSection = (props: BlockedProps) => {
    const isProcessing = useSelector(getIsProcessing);
    const isCompleted = useSelector(getIsCompleted);
    const isSolanaPayCompleted = useSelector(getIsSolanaPayCompleted);
    const isError = useSelector(getIsError);
    const paymentMethod = useSelector(getPaymentMethod);
    const mergedState = useSelector(getMergedState)

    let paymentMethodCompleted = paymentMethod == 'connect-wallet' ? isCompleted : isSolanaPayCompleted;

    if (props.isBlocked == 'true') {
        return <GeoBlockedView />;
    } else if (mergedState > MergedState.start && mergedState < MergedState.laggedCompleting) {
        return <PaymentLoadingView />;
    } else if (paymentMethodCompleted) {
        return <ThankYouView />;
    } else if (isError) {
        return <ErrorView />;
    } else {
        return <PaymentView />;
    }
};

export default CheckoutSection;
