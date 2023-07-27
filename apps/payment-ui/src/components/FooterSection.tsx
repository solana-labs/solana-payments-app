import * as Button from '@/components/Button';
import CancelTransactionButton from '@/components/CancelTransactionButton';
import SolanaPayErrorView from '@/components/SolanaPayErrorView';
import WalletSection from '@/components/WalletSection';
import {
    Notification,
    getConnectWalletNotification,
    getIsSolanaPayNotification,
    getSolanaPayNotification,
} from '@/features/notification/notificationSlice';
import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { MergedState, getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

const FooterSection = () => {
    const paymentMethod = useSelector(getPaymentMethod);
    const mergedState = useSelector(getMergedState);
    const isSolanaPayNotification = useSelector(getIsSolanaPayNotification);
    const solanaPayNotification = useSelector(getSolanaPayNotification);
    const connectedWalletNotification = useSelector(getConnectWalletNotification);

    const paymentDetails = useSelector(getPaymentDetails);
    const router = useRouter();

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
        <div className="container w-full max-w-2xl mx-auto bg-white text-white text-center px-4 sm:px-20">
            <div className="">
                {isPayWithWalletSection() && <WalletSection />}
                {isSolanaPayErrorView() && <SolanaPayErrorView />}
                {isCancelTransactionButton() && <CancelTransactionButton />}
            </div>
            <Button.Primary
                onClick={() => router.push(paymentDetails?.cancelUrl!)}
                className="bg-red-600 text-white w-full shadow-xl text-lg my-2"
            >
                Cancel order
            </Button.Primary>
        </div>
    );
};

export default FooterSection;
