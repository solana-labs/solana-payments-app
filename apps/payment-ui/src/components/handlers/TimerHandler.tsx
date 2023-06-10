import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { timerTick } from '@/features/pay-tab/paySlice';

const TimerHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    console.log('TIMER')

    useEffect(() => {
        const interval = 2000; // 2 seconds

        const timer = setInterval(() => {
            dispatch(timerTick());
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);

    return null;
};

export default TimerHandler;
