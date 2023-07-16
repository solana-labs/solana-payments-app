import FooterSection from '@/components/FooterSection';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import React from 'react';
import DisplaySection from '../components/DisplaySection';
import MainSection from '../components/MainSection';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    };
};

export default function Home() {
    return (
        <>
            <React.Fragment>
                <div className="flex flex-col h-screen bg-black">
                    <DisplaySection />
                    <MainSection />
                    <FooterSection />
                </div>
            </React.Fragment>
        </>
    );
}
