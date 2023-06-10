import React, { ReactNode } from 'react';
import DisplaySection from './DisplaySection';
import CheckoutSection from './CheckoutSection';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPaymentId, setPaymentId } from '@/features/pay-tab/paySlice';
import { BlockedProps } from '@/pages';

interface CheckoutWrapperProps {
    children: ReactNode;
}
  
const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({ children }) => {
    return (
      <div className="w-full mx-auto rounded-t-xl bg-white sm:h-[95vh] h-[90vh] sm:px-16 px-4">
        {children}
      </div>
    );
};

const MainSection = (props: BlockedProps) => {
    const router = useRouter();

    if (!router.isReady) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-[100vh] w-full max-w-2xl mx-auto">
            <DisplaySection />
            <CheckoutWrapper>
                <CheckoutSection isBlocked={props.isBlocked} country={props.country} />
            </CheckoutWrapper>
        </div>
    );
};

export default MainSection;
