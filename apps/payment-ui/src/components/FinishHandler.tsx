import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { timerTick } from '@/features/pay-tab/paySlice';

const FinishHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const interval = 3000; // 2 seconds

        const timer = setInterval(() => {
            window.location.href = 'https://www.apple.com/';
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch]);

    return null;
};

export default FinishHandler;
