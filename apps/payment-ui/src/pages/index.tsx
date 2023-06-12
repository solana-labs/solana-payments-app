import Head from 'next/head';
import MainSection from '../components/MainSection';
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router';
import React from 'react' 


export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    }
}

export type BlockedProps = {
    isBlocked: string;
    country: string;
};
  

export default function Home({
    isBlocked,
    country
  }: BlockedProps) {

    return (
        <React.Fragment>
            <div>
                <Head>
                    <title>{country}</title>
                </Head>
                <div className="min-h-screen bg-black flex flex-col justify-between items-center">
                    <div className="w-full flex-grow flex items-end">
                        <MainSection isBlocked={isBlocked} country={country} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
