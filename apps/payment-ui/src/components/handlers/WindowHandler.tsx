import { getHeight, setIsMobile } from '@/features/mobile/mobileSlice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';

const WindowHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const height = useSelector(getHeight);

    useEffect(() => {
        const handleResize = () => {
            dispatch(setIsMobile(window.innerWidth < 640));
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    return null;
};

export default WindowHandler;
