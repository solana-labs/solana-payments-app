import {
    fetchPaymentDetails,
    getPaymentId,
    shouldPaymentDetailsBeFetched,
} from '@/features/payment-details/paymentDetailsSlice';
import { WebsocketSesssionState, getWebsocketSessionState } from '@/features/websocket/websocketSlice';
import { AppDispatch } from '@/store';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const PaymentDetailsHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const paymentId = useSelector(getPaymentId);
    const shouldFetch = useSelector(shouldPaymentDetailsBeFetched);
    const websocketSessionState = useSelector(getWebsocketSessionState);

    useEffect(() => {
        if (shouldFetch && paymentId && websocketSessionState == WebsocketSesssionState.connected) {
            dispatch(fetchPaymentDetails());
        }

        return () => {};
    }, [dispatch, paymentId, shouldFetch, websocketSessionState]);

    return null;
};

export default PaymentDetailsHandler;
