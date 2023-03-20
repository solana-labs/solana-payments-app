import { PaymentMethodTab } from '@/features/pay-tab/PaymentMethodTab';
import { PayToLabel } from '@/features/pay-tab/PayToLabel';
import React from 'react';
import BuyButton from './BuyButton';
import { MdArrowBack } from 'react-icons/md';
import Image from 'next/image'
import WalletButton from './WalletButton';

const MainSection = () => {
  return (
    <div className='flex flex-col h-[100vh] justify-between w-full max-w-5xl mx-auto'>
        <div className='flex flex-row w-full sm:h-[5vh] h-[10vh]'>
          <div className="w-full relative flex flex-row items-center justify-center">
            <div className='absolute flex flex-row justify-start w-full sm:px-8 px-4'>
              <MdArrowBack color='white' size={30} />
            </div>
            <div className='absolute flex flex-row justify-center w-full'>
              <Image src="/solana-pay.svg" alt="Solana Pay Logo" width={80} height={200} />
            </div>
          </div>
        </div>
        <div className="w-full mx-auto rounded-t-xl bg-white flex flex-col justify-between sm:h-[95vh] h-[90vh] sm:px-16 pt-16 px-4">
          <div className='w-full flex flex-col'>
            <div className="relative pb-8 flex-col hidden sm:flex">
              <PaymentMethodTab />
            </div>
            <div className="relative flex flex-col">
              <PayToLabel />
            </div>
          </div>
          <div className="relative pb-28 flex flex-col">
            <div>
              <WalletButton />
            </div>
            <div className='pt-4'>
              <BuyButton />
            </div>
          </div>
      </div>
    </div>
  );
};

export default MainSection;
