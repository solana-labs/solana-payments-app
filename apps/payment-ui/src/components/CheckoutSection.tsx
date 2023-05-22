import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { getPaymentDetails, getPaymentMethod } from '@/features/pay-tab/paySlice';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import { AppDispatch } from '@/store';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BuyButton from './BuyButton';
import PayWithQRCodeSection from './PayWithQRCodeSection';
import PayWithWalletSection from './PayWithWalletSection';
import { QRCode } from './QRCode';
import { createQR } from './SolanaPayQRCode';
import WalletButton from './WalletButton';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import Image from 'next/image';
import { ThankYouView } from './ThankYou';
import { PaymentView } from './PaymentView';
import { ErrorGoBack } from './ErrorGoBack';

const CheckoutSection = () => {
    const paymentDetails = useSelector(getPaymentDetails);

    return (
        // <div className="w-full mx-auto rounded-t-xl bg-white flex flex-col justify-between sm:h-[95vh] h-[90vh] sm:px-16 pt-16 px-4"></div>
        <div className="w-full mx-auto rounded-t-xl bg-white  sm:h-[95vh] h-[90vh] sm:px-16 px-4">
            <ErrorGoBack top='Your session timed out.' bottom='Please go back and checkout again.' />
            {/* { paymentDetails.redirectUrl != null ? <ThankYouView /> : <PaymentView /> } */}
        </div>
    );
};

export default CheckoutSection;
