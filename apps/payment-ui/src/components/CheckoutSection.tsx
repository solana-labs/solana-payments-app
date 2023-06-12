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
import { getIsCompleted, getPaymentDetails, getIsProcessing, getIsError, getIsSolanaPayCompleted } from '@/features/payment-session/paymentSessionSlice';
import { ErrorView } from './ErrorView';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';

const CheckoutSection = (props: BlockedProps) => {

    const isProcessing = useSelector(getIsProcessing);
    const isCompleted = useSelector(getIsCompleted)
    const isSolanaPayCompleted = useSelector(getIsSolanaPayCompleted)
    const isError = useSelector(getIsError)
    const paymentMethod = useSelector(getPaymentMethod)

    let paymentMethodCompleted = paymentMethod == 'connect-wallet' ? isCompleted : isSolanaPayCompleted;

    return <PaymentLoadingView />

    // if ( props.isBlocked == 'true' ) {
    //     return <GeoBlockedView />
    // } else if ( isProcessing && paymentMethod == 'connect-wallet' ) {
    //     return <PaymentLoadingView />
    // } else if ( paymentMethodCompleted ) {
    //     return <ThankYouView />
    // } else if ( isError ) {
    //     return <ErrorView />
    // } else {
    //     return <PaymentView />
    // }

}

export default CheckoutSection;