import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getPaymentId, getSessionState, SessionState, setCompleted, setPaymentDetails, setProcessing, socketConnected } from '@/features/payment-session/paymentSessionSlice';

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

                if ( data.messageType == 'paymentDetails' ) {
                    dispatch(setPaymentDetails(data.paymentDetails))
                } else if ( data.messageType == 'processingTransaction' ) {
                    dispatch(setProcessing())
                } else if ( data.messageType == 'completedPayment' ) {
                    dispatch(setCompleted(data.completedDetails)) 
                }

            };
              
            socket.current.onclose = () => {
                console.log('WebSocket is closed now.');
            };
              
            socket.current.onerror = (error) => {
                console.log('WebSocket encountered error: ', error);
            };

        }

        if ( sessionState == SessionState.sendMessage ) {
            socket.current?.send('Hello from the client!')
            // console.log(socket.current)
        }

        return () => {
            // if ( socket ) {
            //     socket.close();
            // }
        };
    }, [dispatch, sessionState]);

    return <div>Hello</div>;
};

export default WebsocketHandler;
