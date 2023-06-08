import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { getIsMobile } from '@/features/mobile/mobileSlice';
<<<<<<< HEAD
import { setPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
=======
import { setPaymentMethod } from '@/features/pay-tab/paySlice';
>>>>>>> e9c2b24 (merging in recent changes to demo (#244))

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
