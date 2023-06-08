import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getIsMobile } from '@/features/mobile/mobileSlice';
import { setPaymentMethod } from '@/features/pay-tab/paySlice';

const SetPaymentMethodHandler: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useSelector(getIsMobile)

    useEffect(() => {
        if ( isMobile ) {
            dispatch(setPaymentMethod('connect-wallet'))
        }
    }, [dispatch, isMobile])

    return null;
};

export default SetPaymentMethodHandler;
