import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { getPaymentMethod, setPaymentMethod, getPaymentErrors, PayError, PaymentDetails } from '@/features/pay-tab/paySlice';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import { AppDispatch, RootState } from '@/store';
import React, { ReactNode, useEffect, useRef } from 'react';
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
import { PaymentLoadingView } from './PaymentLoadingView';
import { getIsCompleted, getPaymentDetails, getProcessingTransaction } from '@/features/payment-session/paymentSessionSlice';

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
    const isProcessing = useSelector(getProcessingTransaction);
    const isCompleted = useSelector(getIsCompleted)

    if ( props.isBlocked == 'true' ) {
        return <GeoBlockedView />
    } else if ( isProcessing ) {
        return <PaymentLoadingView />
    } else if ( isCompleted ) {
        return <ThankYouView />
    } else {
        return <PaymentView />
    }

}

export default CheckoutSection;