import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPaymentRedirectUrl } from '@/features/payment-details/paymentDetailsSlice';

const FinishHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const redirectUrl = useSelector(getPaymentRedirectUrl);

    useEffect(() => {
        const interval = 3000; // 3 seconds

        const timer = setInterval(() => {
            if (redirectUrl != null) {
                window.location.href = redirectUrl;
            }
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);

    return null;
};

export default FinishHandler;
