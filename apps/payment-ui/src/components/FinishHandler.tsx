import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { getPaymentDetails } from '@/features/pay-tab/paySlice';

const FinishHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const paymentDetails = useSelector(getPaymentDetails);

    useEffect(() => {
        const interval = 3000; // 3 seconds

        const timer = setInterval(() => {
            if ( paymentDetails?.redirectUrl != null ) {
                window.location.href = paymentDetails.redirectUrl;
            }
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);

    return null;
};

export default FinishHandler;
