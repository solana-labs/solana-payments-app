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
import { getIsCompleted, getPaymentDetails, getIsProcessing, getIsError } from '@/features/payment-session/paymentSessionSlice';
import { ErrorView } from './ErrorView';

const CheckoutSection = (props: BlockedProps) => {

    const isProcessing = useSelector(getIsProcessing);
    const isCompleted = useSelector(getIsCompleted)
    const isError = useSelector(getIsError)

    if ( props.isBlocked == 'true' ) {
        return <GeoBlockedView />
    } else if ( isProcessing ) {
        return <PaymentLoadingView />
    } else if ( isCompleted ) {
        return <ThankYouView />
    } else if ( isError ) {
        return <ErrorView />
    } else {
        return <PaymentView />
    }

}

export default CheckoutSection;