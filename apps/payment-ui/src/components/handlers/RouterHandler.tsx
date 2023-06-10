import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { useRouter } from 'next/router';
import { setPaymentId } from '@/features/payment-session/paymentSessionSlice';

const RouterHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    if (!router.isReady) {
        return null;
    }

    const { paymentId } = router.query;

    useEffect(() => {
        dispatch(setPaymentId(paymentId as string));
    }, [dispatch]);

    return null;
};

export default RouterHandler;
