import {
    Notification,
    getConnectWalletNotification,
    getIsSolanaPayNotification,
} from '@/features/notification/notificationSlice';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { MergedState, getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { useSelector } from 'react-redux';
import CancelTransactionButton from './CancelTransactionButton';
import PayWithWalletSection from './PayWithWalletSection';
import SolanaPayErrorView from './SolanaPayErrorView';

const FooterSection = () => {
    const paymentMethod = useSelector(getPaymentMethod);
    const mergedState = useSelector(getMergedState);
    const isSolanaPayNotification = useSelector(getIsSolanaPayNotification);
    const connectedWalletNotification = useSelector(getConnectWalletNotification);

    if (paymentMethod == 'connect-wallet' && mergedState == MergedState.start) {
        return <PayWithWalletSection />;
    } else if (paymentMethod == 'qr-code' && isSolanaPayNotification) {
        return <SolanaPayErrorView />;
    } else if (
        mergedState > MergedState.start &&
        mergedState < MergedState.completed &&
        connectedWalletNotification != Notification.declined
    ) {
        return <CancelTransactionButton />;
    } else {
        return <div></div>;
    }
};

export default FooterSection;
