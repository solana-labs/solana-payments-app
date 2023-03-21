import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import React from 'react';
import BuyButton from './BuyButton';
import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image'
import WalletButton from './WalletButton';
import DisplaySection from './DisplaySection';
import CheckoutSection from './CheckoutSection';

const MainSection = () => {
  return (
    <div className='flex flex-col h-[100vh] w-full max-w-2xl mx-auto'>
        <DisplaySection />
        <CheckoutSection />
    </div>
  );
};

export default MainSection; 
