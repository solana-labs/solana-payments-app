import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { WebsocketSesssionState, getWebsocketSessionState, setWebsocketConnected, setWebsocketClosed, setWebsocketReadyToConnect } from '@/features/websocket/websocketSlice';
import { getWebSocketUrl } from '@/features/env/envSlice';
import { getPaymentId, setRedirectUrl } from '@/features/payment-details/paymentDetailsSlice';
import { setTransactionDelivered, setTransactionRequestStarted, setCompleting, setError, setProcessing, resetSession } from '@/features/payment-session/paymentSessionSlice';
import { setNotification, Notification, NotificationType } from '@/features/notification/notificationSlice';

const WebsocketHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const websocketUrl = useSelector(getWebSocketUrl)
    const websocketSessionState = useSelector(getWebsocketSessionState);
    const paymentId = useSelector(getPaymentId);

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
                    console.log('why not us!')
                    dispatch(setTransactionDelivered())
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
                }

                // } else if ( data.messageType == 'completedDetails' ) {
                //     console.log(data)
                //     dispatch(setCompleted(data.payload.completedDetails)) 
                // } else if ( data.messageType == 'errorDetails' ) {
                //     dispatch(setErrorDetails(data.payload.errorDetails)) 
                // } else if ( data.messageType == 'processingTransaction' ) {
                //     dispatch(setProcessing())
                // } else if ( data.messageType == 'transactionRequestStarted' ) {
                //     dispatch(setTransactionRequestStarted())
                // } else if ( data.messageType == 'transactionDelivered' ) {
                //     dispatch(setTransactionDelivered())
                // } else if ( data.messageType == 'failedProcessingTransaction' ) {
                //     dispatch(setFailedProcessing())
                // } else if ( data.messageType == 'transactionRequestFailed') {
                //     dispatch(setTransactionRequestFailed())
                // } else if ( data.messageType == 'insufficientFunds') {
                //     dispatch(setNotification(Notification.insufficentFunds))
                // }

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
