import CancelTransactionButton from '@/components/CancelTransactionButton';
import SolanaPayErrorView from '@/components/SolanaPayErrorView';
import WalletSection from '@/components/WalletSection';
import {
    Notification,
    getConnectWalletNotification,
    getIsSolanaPayNotification,
    getSolanaPayNotification,
} from '@/features/notification/notificationSlice';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { MergedState, getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { useSelector } from 'react-redux';

const FooterSection = () => {
    const paymentMethod = useSelector(getPaymentMethod);
    const mergedState = useSelector(getMergedState);
    const isSolanaPayNotification = useSelector(getIsSolanaPayNotification);
    const solanaPayNotification = useSelector(getSolanaPayNotification);
    const connectedWalletNotification = useSelector(getConnectWalletNotification);

    const isPayWithWalletSection = () =>
        paymentMethod == 'connect-wallet' &&
        mergedState == MergedState.start &&
        connectedWalletNotification != Notification.declined &&
        solanaPayNotification != Notification.transactionDoesNotExist;
    const isSolanaPayErrorView = () => paymentMethod == 'qr-code' && isSolanaPayNotification;
    const isCancelTransactionButton = () =>
        mergedState > MergedState.start &&
        mergedState < MergedState.completed &&
        connectedWalletNotification != Notification.declined;

    return (
        <div className="w-full">
            <div className="container h-36 mx-auto px-4 sm:px-20 bg-white text-white text-center max-w-2xl">
                {isPayWithWalletSection() && <WalletSection />}
                {isSolanaPayErrorView() && <SolanaPayErrorView />}
                {isCancelTransactionButton() && <CancelTransactionButton />}
            </div>
        </div>
    );
};

export default FooterSection;
