import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getIsCompleting, setCompleted } from '@/features/payment-session/paymentSessionSlice';

const CompletingHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isCompleting = useSelector(getIsCompleting);
    let timer = useRef<any | null>(null);

    useEffect(() => {
        if (isCompleting) {
            const interval = 2000; // 2 seconds

            timer.current = setInterval(() => {
                clearInterval(timer.current);
                dispatch(setCompleted());
            }, interval);
        }

        return () => {};
    }, [dispatch, isCompleting]);

    return null;
};

export default CompletingHandler;
