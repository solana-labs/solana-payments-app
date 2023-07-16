import { getPaymentDetails } from '@/features/payment-details/paymentDetailsSlice';
import { useSelector } from 'react-redux';
import { ErrorGoBack } from './ErrorGoBack';

export const GeoBlockedView = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    return (
        <ErrorGoBack
            top={'GeoBlocked'}
            bottom={'Sorry, we are not allowed to operate in your jurisdiction'}
            redirect={paymentDetails?.cancelUrl ?? null}
        />
    );
};
