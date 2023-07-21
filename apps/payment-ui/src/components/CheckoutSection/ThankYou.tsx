import { getPaymentRedirectUrl } from '@/features/payment-details/paymentDetailsSlice';
import { AppDispatch } from '@/store';
import Image from 'next/image';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const ThankYouView = () => {
    const dispatch = useDispatch<AppDispatch>();
    const redirectUrl = useSelector(getPaymentRedirectUrl);

    useEffect(() => {
        const interval = 2000; // 3 seconds

        const timer = setInterval(() => {
            if (redirectUrl != null) {
                window.location.href = redirectUrl;
            }
        }, interval);

        return () => {
            clearInterval(timer);
        };
    }, [dispatch, redirectUrl]);

    return (
        <div className="flex flex-col">
            <Image
                src="/check.svg"
                alt="Completed Payment"
                className="mx-auto w-16 h-16 mt-7 mb-4"
                width={10}
                height={10}
            />
            <div className="text-3xl  mx-auto">Thanks for your order.</div>
            <div className="text-1xl text-gray-600 mx-auto pt-4">Your payment was successful.</div>
            <div className="divider w-full" />
            <div className="text-sm text-gray-400 font-light mx-auto">
                We&apos;re redirecting you back to Shopify...
            </div>
        </div>
    );
};
