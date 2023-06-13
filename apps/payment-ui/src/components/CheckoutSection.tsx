import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import {
    getIsCompleted,
    getIsError,
    getIsProcessing,
    getIsSolanaPayCompleted,
} from '@/features/payment-session/paymentSessionSlice';
import { BlockedProps } from '@/pages';
import { useSelector } from 'react-redux';
import { ErrorView } from './ErrorView';
import { GeoBlockedView } from './GeoBlockedView';
import { PaymentLoadingView } from './PaymentLoadingView';
import { PaymentView } from './PaymentView';
import { ThankYouView } from './ThankYou';

const CheckoutSection = (props: BlockedProps) => {
    const isProcessing = useSelector(getIsProcessing);
    const isCompleted = useSelector(getIsCompleted);
    const isSolanaPayCompleted = useSelector(getIsSolanaPayCompleted);
    const isError = useSelector(getIsError);
    const paymentMethod = useSelector(getPaymentMethod);

    let paymentMethodCompleted = paymentMethod == 'connect-wallet' ? isCompleted : isSolanaPayCompleted;

    if (true) {
        return <PaymentLoadingView />;
    }

    if (props.isBlocked == 'true') {
        return <GeoBlockedView />;
    } else if (isProcessing && paymentMethod == 'connect-wallet') {
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
