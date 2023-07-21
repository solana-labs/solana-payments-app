import {
    fetchPaymentDetails,
    getPaymentId,
    shouldPaymentDetailsBeFetched,
} from '@/features/payment-details/paymentDetailsSlice';
import { WebsocketSesssionState, getWebsocketSessionState } from '@/features/websocket/websocketSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';

const PaymentDetailsHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const paymentId = useSelector(getPaymentId);
    const shouldFetch = useSelector(shouldPaymentDetailsBeFetched);
    const websocketSessionState = useSelector(getWebsocketSessionState);

    useEffect(() => {
        if (shouldFetch && paymentId && websocketSessionState == WebsocketSesssionState.connected) {
            console.log('fetching payment details');
            dispatch(fetchPaymentDetails());
        }

        return () => {};
    }, [dispatch, backendUrl, paymentId, shouldFetch, websocketSessionState]);

    return null;
};

export default PaymentDetailsHandler;
