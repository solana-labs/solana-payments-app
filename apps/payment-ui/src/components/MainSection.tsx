import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import React from 'react';
import BuyButton from './BuyButton';
import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image'

const MainSection = () => {
  return (
    <div className='flex flex-col h-[100vh] justify-start w-full'>
        <div className='flex flex-row w-full h-[10vh]'>
          <div className="w-full relative flex flex-row items-center justify-center">
            <div className='absolute flex flex-row justify-start w-full pl-4'>
              <MdArrowBack color='white' size={30} />
            </div>
            <div className='absolute flex flex-row justify-center w-full'>
              <Image src="/solana-pay.svg" alt="My SVG" width={80} height={200} />
            </div>
          </div>
        </div>
        <div className="w-full max-w-3xl mx-auto rounded-t-xl bg-white flex flex-col justify-between h-[90vh] sm:px-16 pt-16 px-4">
          <div className='w-full flex flex-col'>
            <div className="relative pb-8 flex-col hidden sm:flex">
              <PaymentMethodTab />
            </div>
            <div className="relative flex flex-col">
              <PayToLabel />
            </div>
          </div>
          <div className="relative pb-28 flex flex-col">
            <BuyButton />
          </div>
      </div>
    </div>
  );
};

export default MainSection;
