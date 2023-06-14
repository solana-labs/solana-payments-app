import { DefaultLayout } from '@/components/DefaultLayout';
import { SupportFaq } from '@/components/SupportFaq';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Router from 'next/router';

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

export default function Support({ isBlocked, country }: BlockedProps) {
    if (isBlocked === 'true') {
        Router.push('/');
    }
    return (
        <>
            <Head>
                <title>Solana Pay - Support</title>
                <meta name="description" content="Support" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <SupportFaq />
                </DefaultLayout>
            </div>
        </>
    );
}
