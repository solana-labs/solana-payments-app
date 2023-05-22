import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { getPaymentMethod } from '@/features/pay-tab/paySlice';
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

const CheckoutSection = () => {
    const dispatch = useDispatch<AppDispatch>();
    const paymentMethod = useSelector(getPaymentMethod);

    return (
        // <div className="w-full mx-auto rounded-t-xl bg-white flex flex-col justify-between sm:h-[95vh] h-[90vh] sm:px-16 pt-16 px-4"></div>
        <div className="w-full mx-auto rounded-t-xl bg-white flex flex-col justify-between sm:h-[95vh] h-[90vh] sm:px-16 px-4">
            <div className="flex flex-col">
                <Image src="/check.svg" alt="Completed Payment" className="mx-auto w-16 h-16 mt-7 mb-4" width={10} height={10} />
                <div className="text-3xl text-black mx-auto">{"Thanks for your order."}</div>
                <div className="text-1xl text-gray-600 mx-auto pt-4">{"Your payment was successful."}</div>
                <div className="divider w-full" />
                <div className="text-sm text-gray-400 font-light mx-auto">{"We're redirecting you back to Shopify..."}</div>
            </div>
            
            
            {/* <div className="w-full flex flex-col">
                <div className="relative pb-8 flex-col hidden sm:flex">
                    <PaymentMethodTab />
                </div>
                <div className="relative flex flex-col">
                    <PayToLabel />
                </div>
            </div>
            <div className="relative flex flex-col h-full">
                {paymentMethod == 'connect-wallet' ? <PayWithWalletSection /> : <PayWithQRCodeSection />}
            </div> */}
        </div>
    );
};

export default CheckoutSection;
