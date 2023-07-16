import { BlockedProps } from '@/pages';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import CheckoutSection from './CheckoutSection';

interface CheckoutWrapperProps {
    children: ReactNode;
}

const CheckoutWrapper: React.FC<CheckoutWrapperProps> = ({ children }) => {
    return <div className="flex flex-grow flex-col h-full">{children}</div>;
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
