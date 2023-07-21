import { setPaymentId } from '@/features/payment-details/paymentDetailsSlice';
import { setWebsocketReadyToConnect } from '@/features/websocket/websocketSlice';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

const RouterHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const paymentId = router.query.paymentId as string;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        dispatch(setPaymentId(paymentId));
        dispatch(setWebsocketReadyToConnect());
    }, [router.isReady, paymentId, dispatch]);

    return null;
};

export default RouterHandler;
