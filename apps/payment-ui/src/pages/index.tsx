import FooterSection from '@/components/FooterSection';
import { getPaymentMethod } from '@/features/payment-options/paymentOptionsSlice';
import { getMergedState } from '@/features/payment-session/paymentSessionSlice';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import React from 'react';
import { useSelector } from 'react-redux';
import DisplaySection from '../components/DisplaySection';
import MainSection from '../components/MainSection';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    };
};

export type BlockedProps = {
    isBlocked: string;
    country: string;
};

export default function Home({ isBlocked, country }: BlockedProps) {
    const paymentMethod = useSelector(getPaymentMethod);
    const mergedState = useSelector(getMergedState);

    return (
        <>
            <Head>
                <title>Solana Pay Payment Portal</title>
                <meta name="description" content="Use Solana Pay for your Shopify Checkout" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <React.Fragment>
                <div className="flex flex-col h-screen bg-black">
                    <DisplaySection />
                    <div className="flex flex-col flex-auto bg-black">
                        <div className="flex-grow container mx-auto bg-white rounded-t-2xl max-w-2xl px-4 sm:px-20">
                            <MainSection isBlocked={'false'} country={'usa'} />
                        </div>
                    </div>
                    <FooterSection />
                </div>
            </React.Fragment>
        </>
    );
}
