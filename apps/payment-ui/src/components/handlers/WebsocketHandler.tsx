import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPaymentId, getSessionState, SessionState, setClosed, setCompleted, setErrorDetails, setPaymentDetails, setProcessing, setReadyToConnect, setTransactionDelivered, setTransactionRequestFailed, setTransactionRequestStarted, socketConnected } from '@/features/payment-session/paymentSessionSlice';

const WebsocketHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const sessionState = useSelector(getSessionState)
    const paymentId = useSelector(getPaymentId)

    let socket = useRef<WebSocket | null>(null);
    let timer = useRef<any | null>(null);
    useEffect(() => {

        if ( sessionState == SessionState.readyToConnect ) {

            if (socket.current !== null) {
                socket.current.close();
            }

            socket.current = new WebSocket( process.env.NEXT_PUBLIC_WEBSOCKET_URL + '?paymentId=' + paymentId);

            socket.current.onopen = () => {
                console.log('WebSocket Client Connected');
                dispatch(socketConnected())
            };
              
            socket.current.onmessage = (event) => {

                const data = JSON.parse(event.data);
                console.log('Message: ' + data.messageType)

                if ( data.messageType == 'paymentDetails' ) {
                    dispatch(setPaymentDetails(data.paymentDetails))
                } else if ( data.messageType == 'completedDetails' ) {
                    dispatch(setCompleted(data.completedDetails)) 
                } else if ( data.messageType == 'errorDetails' ) {
                    dispatch(setErrorDetails(data.errorDetails)) 
                } else if ( data.messageType == 'processingTransaction' ) {
                    dispatch(setProcessing())
                } else if ( data.messageType == 'transactionRequestStarted' ) {
                    dispatch(setTransactionRequestStarted())
                } else if ( data.messageType == 'transactionDelivered' ) {
                    dispatch(setTransactionDelivered())
                } else if ( data.messageType == 'failedProcessingTransaction' ) {
                    
                } else if ( data.messageType == 'transactionRequestFailed') {
                    dispatch(setTransactionRequestFailed())
                }

            };
              
            socket.current.onclose = () => {
                console.log('WebSocket is closed now.');
                dispatch(setClosed())
            };
              
            socket.current.onerror = (error) => {
                console.log('WebSocket encountered error: ', error);
            };

        } else if ( sessionState == SessionState.closed ) {
            const interval = 5000; // 5 seconds

            timer.current = setInterval(() => {
                console.log('BANG')
                clearInterval(timer.current);
                dispatch(setReadyToConnect())
            }, interval);
        }

        return () => {
            // TODO: Uncomment?
            // if ( socket ) {
            //     socket.close();
            // }
        };
    }, [dispatch, sessionState]);

    return null;
};

export default WebsocketHandler;
