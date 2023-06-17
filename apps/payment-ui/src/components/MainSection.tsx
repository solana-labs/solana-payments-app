import React, { ReactNode } from 'react';
import DisplaySection from './DisplaySection';
import CheckoutSection from './CheckoutSection';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { BlockedProps } from '@/pages';

interface CheckoutWrapperProps {
    children: ReactNode;
}
  
const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({ children }) => {
    return (
      <div className='flex flex-grow flex-col h-full'>
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
        <CheckoutWrapper>
            <CheckoutSection />
        </CheckoutWrapper>
    );
};

export default MainSection;
