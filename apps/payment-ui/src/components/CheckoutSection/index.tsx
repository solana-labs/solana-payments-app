import { getIsBlocked } from '@/features/geo/geoSlice';
import { Notification, getConnectWalletNotification } from '@/features/notification/notificationSlice';
import { getIsPaymentError } from '@/features/payment-details/paymentDetailsSlice';
import { MergedState, getIsCompleted, getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { useSelector } from 'react-redux';
import CancelledTransactionView from './CancelledTransactionView';
import { ErrorView } from './ErrorView';
import { GeoBlockedView } from './GeoBlockedView';
import { PaymentLoadingView } from './PaymentLoadingView';
import { PaymentView } from './PaymentView';
import { ThankYouView } from './ThankYou';

const CheckoutSection = () => {
    const isCompleted = useSelector(getIsCompleted);
    const isError = useSelector(getIsPaymentError);
    const mergedState = useSelector(getMergedState);
    const isBlocked = useSelector(getIsBlocked);
    const connectedWalletNotification = useSelector(getConnectWalletNotification);

    if (isBlocked) {
        return <GeoBlockedView />;
    } else if (connectedWalletNotification == Notification.declined) {
        return <CancelledTransactionView />;
    } else if (mergedState > MergedState.start && mergedState < MergedState.completed) {
        return <PaymentLoadingView />;
    } else if (isCompleted) {
        return <ThankYouView />;
    } else if (isError) {
        return <ErrorView />;
    } else {
        return <PaymentView />;
    }
};

export default CheckoutSection;
