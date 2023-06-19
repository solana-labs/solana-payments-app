import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { WebsocketSesssionState, getWebsocketSessionState, setWebsocketConnected, setWebsocketClosed, setWebsocketReadyToConnect } from '@/features/websocket/websocketSlice';
import { getWebSocketUrl } from '@/features/env/envSlice';
import { getPaymentId, setRedirectUrl } from '@/features/payment-details/paymentDetailsSlice';
import { setTransactionDelivered, setTransactionRequestStarted, setCompleting, setError, setProcessing, resetSession, setTransactionRequestFailed } from '@/features/payment-session/paymentSessionSlice';
import { setNotification, Notification, NotificationType, getIsEitherNotification } from '@/features/notification/notificationSlice';

const WebsocketHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const websocketUrl = useSelector(getWebSocketUrl)
    const websocketSessionState = useSelector(getWebsocketSessionState);
    const paymentId = useSelector(getPaymentId);
    const isEitherNotification = useSelector(getIsEitherNotification)

    let socket = useRef<WebSocket | null>(null);
    let timer = useRef<any | null>(null);
    useEffect(() => {

        if ( websocketSessionState == WebsocketSesssionState.readyToConnect && websocketUrl != undefined && paymentId != null ) {

            if (socket.current !== null) {
                socket.current.close();
            }

            socket.current = new WebSocket( websocketUrl + '?paymentId=' + paymentId);

            socket.current.onopen = () => {
                console.log('WebSocket Client Connected');
                dispatch(setWebsocketConnected())
            };
              
            socket.current.onmessage = (event) => {

                const data = JSON.parse(event.data);
                console.log('Message: ' + data.messageType)

                if ( data.messageType == 'transactionRequestStarted' ) {
                    dispatch(setTransactionRequestStarted())
                } else if (data.messageType == 'transactionDelivered') {
                    if ( isEitherNotification == false ) {
                        dispatch(setTransactionDelivered())
                    }
                } else if (data.messageType == 'insufficientFunds') {
                    dispatch(resetSession())
                    dispatch(setNotification({ notification: Notification.insufficentFunds, type: NotificationType.solanaPay }))
                } else if ( data.messageType == 'completedDetails' ) {
                    dispatch(setRedirectUrl(data.payload.completedDetails.redirectUrl))
                    dispatch(setCompleting(data.payload.completedDetails))
                } else if ( data.messageType == 'errorDetails' ) {
                    dispatch(setError(data.payload.errorDetails))
                } else if ( data.messageType == 'processingTransaction' ) {
                    dispatch(setProcessing())
                } else if ( data.messageType == 'transactionRequestFailed') {
                    dispatch(resetSession())
                    dispatch(setNotification({ notification: Notification.transactionRequestFailed, type: NotificationType.solanaPay }))
                    dispatch(setNotification({ notification: Notification.transactionRequestFailed, type: NotificationType.connectWallet }))
                } else if ( data.messageType == 'failedProcessingTransaction' ) {
                    // this one is starting to feel silly and it could mess up some flows
                    // this one really shouldn't happen lol but if it does, we want to know, but shits probably gonna get terminal.
                    // lets try to persist these cases so we can escalate and manually process them.
                } else if ( data.messageType == 'shopifyRetry' ) {
                    dispatch(setNotification({ notification: Notification.shopifyRetry, type: NotificationType.both }))
                }

            };
              
            socket.current.onclose = () => {
                console.log('WebSocket is closed now.');
                dispatch(setWebsocketClosed())
            };
              
            socket.current.onerror = (error) => {
                console.log('WebSocket encountered error: ', error);
            };

        } else if ( websocketSessionState == WebsocketSesssionState.closed ) {
            const interval = 5000; // 5 seconds

            timer.current = setInterval(() => {
                console.log('Trying to connect')
                clearInterval(timer.current);
                dispatch(setWebsocketReadyToConnect())
            }, interval);
        }

        return () => {
            // TODO: Uncomment?
            // if ( socket ) {
            //     socket.close();
            // }
        };
    }, [dispatch, websocketUrl, paymentId, websocketSessionState]);

    return null;
};

export default WebsocketHandler;
