import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { setIsMobile } from '@/features/mobile/mobileSlice';

const WindowHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

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
