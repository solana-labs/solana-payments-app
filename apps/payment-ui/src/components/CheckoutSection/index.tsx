import CancelledTransactionView from '@/components/CheckoutSection/CancelledTransactionView';
import { ErrorView } from '@/components/CheckoutSection/ErrorView';
import { GeoBlockedView } from '@/components/CheckoutSection/GeoBlockedView';
import { PaymentLoadingView } from '@/components/CheckoutSection/PaymentLoadingView';
import { PaymentView } from '@/components/CheckoutSection/PaymentView';
import { ThankYouView } from '@/components/CheckoutSection/ThankYou';
import { Notification, getConnectWalletNotification } from '@/features/notification/notificationSlice';
import { getIsPaymentError } from '@/features/payment-details/paymentDetailsSlice';
import { MergedState, getIsCompleted, getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const CheckoutSection = () => {
    const isCompleted = useSelector(getIsCompleted);
    const isError = useSelector(getIsPaymentError);
    const mergedState = useSelector(getMergedState);
    const connectedWalletNotification = useSelector(getConnectWalletNotification);

    const router = useRouter();
    const blockedString = router.query.blocked as string;
    const blocked = blockedString == 'true' ? true : false;

    if (blocked) {
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
