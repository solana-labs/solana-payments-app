import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPaymentId, getSessionState, SessionState, setCompleted, setErrorDetails, setPaymentDetails, setProcessing, socketConnected } from '@/features/payment-session/paymentSessionSlice';

const WebsocketHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const sessionState = useSelector(getSessionState)
    const paymentId = useSelector(getPaymentId)

    let socket = useRef<WebSocket | null>(null);

    useEffect(() => {

        if ( sessionState == SessionState.readyToConnect ) {

            console.log('WERE READY TO CONNECT')

            // if (socket !== null) {
            //     socket.current.close();
            // }

            socket.current = new WebSocket('ws://localhost:4009/?paymentId=' + paymentId);

            socket.current.onopen = () => {
                console.log('WebSocket Client Connected');
                dispatch(socketConnected())
            };
              
            socket.current.onmessage = (event) => {

                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')
                console.log('MESSAGE')

                const data = JSON.parse(event.data);

                console.log(data.messageType)

                if ( data.messageType == 'paymentDetails' ) {
                    dispatch(setPaymentDetails(data.paymentDetails))
                } else if ( data.messageType == 'completedDetails' ) {
                    dispatch(setCompleted(data.completedDetails)) 
                } else if ( data.messageType == 'errorDetails' ) {
                    dispatch(setErrorDetails(data.errorDetails)) 
                } else if ( data.messageType == 'processingTransaction' ) {
                    dispatch(setProcessing())
                }

            };
              
            socket.current.onclose = () => {
                console.log('WebSocket is closed now.');
            };
              
            socket.current.onerror = (error) => {
                console.log('WebSocket encountered error: ', error);
            };

        }

        return () => {
            // TODO: Uncomment?
            // if ( socket ) {
            //     socket.close();
            // }
        };
    }, [dispatch, sessionState]);

    return <div>Hello</div>;
};

export default WebsocketHandler;
