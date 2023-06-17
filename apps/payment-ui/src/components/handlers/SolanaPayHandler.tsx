// import { useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch } from '../../store';
// import { SolanaPayState, getSolanaPayState, setSolanaPayCompleted } from '@/features/payment-session/paymentSessionSlice';
// import { getRedirectUrl } from '@/features/payment-session/paymentSessionSlice';

// const SolanaPayHandler: React.FC = () => {
//     const dispatch = useDispatch<AppDispatch>();
//     const mergedState = useSelector(get);
//     let timer = useRef<any | null>(null);

//     useEffect(() => {
        
//         if ( solanaPayState == SolanaPayState.completed ) {
//             const interval = 1500; // 1 second

//             timer.current = setInterval(() => {
//                 console.log('Solana Pay Completed')
//                 clearInterval(timer.current);
//                 dispatch(setSolanaPayCompleted())
//             }, interval);
//         }

//         return () => {
            
//         };
//     }, [dispatch, solanaPayState]);

//     return null;
// };

// export default SolanaPayHandler;
