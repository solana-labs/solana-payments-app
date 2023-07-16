import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { useSelector } from 'react-redux';
import { ErrorView } from './ErrorView';

export const GeoBlockedView = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    const error = {
        top: 'GeoBlocked',
        bottom: 'Sorry, we are not allowed to operate in your jurisdiction',
        redirect: paymentDetails?.cancelUrl ?? null,
    };

    return <ErrorView error={error} />;
};
