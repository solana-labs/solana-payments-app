import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPaymentSize } from '@/features/payment-details/paymentDetailsSlice';
import { getBalance } from '@/features/wallet/walletSlice';
import {
    setNotification,
    Notification,
    NotificationType,
    removeNotification,
} from '@/features/notification/notificationSlice';

const BalanceHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const usdcBalance = useSelector(getBalance);
    const paymentSize = useSelector(getPaymentSize);

    useEffect(() => {
        console.log('usdcBalance', usdcBalance);
        console.log('paymentSize', paymentSize);

        if (usdcBalance != null && paymentSize != null && usdcBalance < paymentSize) {
            dispatch(
                setNotification({ notification: Notification.insufficentFunds, type: NotificationType.connectWallet })
            );
        } else if (usdcBalance != null && paymentSize != null && usdcBalance >= paymentSize) {
            dispatch(removeNotification());
        }

        return () => {};
    }, [dispatch, usdcBalance, paymentSize]);

    return null;
};

export default BalanceHandler;
