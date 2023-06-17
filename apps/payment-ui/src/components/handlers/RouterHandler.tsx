import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { useRouter } from 'next/router';
import { setPaymentId } from '@/features/payment-details/paymentDetailsSlice';
import { setGeoIsBlocked } from '@/features/geo/geoSlice';
import { setWebsocketReadyToConnect } from '@/features/websocket/websocketSlice';

const RouterHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    if (!router.isReady) {
        return null;
    }

    console.log(router.query)

    const paymentId = router.query.paymentId as string;
    const blockedString = router.query.blocked as string;
    const blocked = blockedString == 'true' ? true : false;

    useEffect(() => {

        if (blocked) {
            dispatch(setGeoIsBlocked())
        }

        dispatch(setPaymentId(paymentId));
        dispatch(setWebsocketReadyToConnect());

    }, [dispatch]);

    return null;
};

export default RouterHandler;
