import { setGeoIsBlocked } from '@/features/geo/geoSlice';
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
    const blockedString = router.query.blocked as string;
    const blocked = blockedString == 'true' ? true : false;

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        if (blocked) {
            dispatch(setGeoIsBlocked());
        }

        dispatch(setPaymentId(paymentId));
        dispatch(setWebsocketReadyToConnect());
    }, [router.isReady, blocked, paymentId, dispatch]);

    return null;
};

export default RouterHandler;
