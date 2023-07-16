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

    const isPayWithWalletSection = () => paymentMethod == 'connect-wallet' && mergedState == MergedState.start;
    const isSolanaPayErrorView = () => paymentMethod == 'qr-code' && isSolanaPayNotification;
    const isCancelTransactionButton = () =>
        mergedState > MergedState.start &&
        mergedState < MergedState.completed &&
        connectedWalletNotification != Notification.declined;

    return (
        <div className="w-full border border-green-600">
            <div className="container h-36 mx-auto px-4 sm:px-20 bg-white text-white text-center max-w-2xl">
                {isPayWithWalletSection() && <PayWithWalletSection />}
                {isSolanaPayErrorView() && <SolanaPayErrorView />}
                {isCancelTransactionButton() && <CancelTransactionButton />}
            </div>
        </div>
    );
};

export default FooterSection;
