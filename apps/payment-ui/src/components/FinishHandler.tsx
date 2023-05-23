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
<<<<<<< HEAD
            if ( paymentDetails?.redirectUrl != null ) {
=======
            if ( paymentDetails.redirectUrl != null ) {
>>>>>>> 86fe4f692213d68c821b5d257f8215a0eeb8214a
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
