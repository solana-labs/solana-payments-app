import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { getPaymentDetails, getPaymentMethod, setPaymentMethod, getPaymentErrors, PayError, PaymentDetails } from '@/features/pay-tab/paySlice';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import { AppDispatch, RootState } from '@/store';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PayWithQRCodeSection from './PayWithQRCodeSection';
import PayWithWalletSection from './PayWithWalletSection';
import { QRCode } from './QRCode';
import { createQR } from './SolanaPayQRCode';
import WalletButton from './WalletButton';
import { setIsMobile } from '@/features/mobile/mobileSlice';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import Image from 'next/image';
import { ThankYouView } from './ThankYou';
import { PaymentView } from './PaymentView';
import { ErrorGoBack } from './ErrorGoBack';
import { BlockedProps } from '@/pages';
import { GeoBlockedView } from './GeoBlockedView';

const PaymentErrorView = ( props: { payError: PayError } ) => {
    return <ErrorGoBack top={props.payError.errorTitle} bottom={props.payError.errorDetail} redirect={props.payError.errorRedirect} />
}

const PaymentDeatilView = ( props: { paymentDetails: PaymentDetails | null } ) => {
    return ( props.paymentDetails?.redirectUrl != null ? <ThankYouView /> : <PaymentView /> )
}

const PaymentRootView = ( props: { payError: PayError | null, payDetail: PaymentDetails | null } ) => {
    return ( props.payError != null ? <PaymentErrorView payError={props.payError} /> : <PaymentDeatilView paymentDetails={props.payDetail} /> )
}

const BlockedOrNotRootView = ( props: { payError: PayError | null, payDetail: PaymentDetails | null, isBlocked: string } ) => {
    return ( props.isBlocked == 'true' ? <GeoBlockedView /> : <PaymentRootView payError={props.payError} payDetail={props.payDetail} /> )
}

const CheckoutSection = (props: BlockedProps) => {

    const paymentDetails = useSelector(getPaymentDetails);
    const paymentErrors = useSelector(getPaymentErrors);

    return (
        <div className="w-full mx-auto rounded-t-xl bg-white  sm:h-[95vh] h-[90vh] sm:px-16 px-4">
            <BlockedOrNotRootView payError={paymentErrors} payDetail={paymentDetails} isBlocked={props.isBlocked} />
        </div>
    );
};

export default CheckoutSection;
