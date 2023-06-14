import { DefaultLayout } from '@/components/DefaultLayout';
import { Refunds } from '@/components/Refunds';
import { isOk } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
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

export default function RefundsPage({ isBlocked, country }: BlockedProps) {
    console.log('is blcoked?', isBlocked);
    // if (isBlocked === 'true') {
    //     Router.push('/');
    // }
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    if (isOk(merchantInfo) && !merchantInfo.data.completed) {
        Router.push('/getting-started');
    }
    return (
        <>
            <Head>
                <title>Solana Pay - Merchant</title>
                <meta name="description" content="Update merchant information" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full">
                    <Refunds />
                </DefaultLayout>
            </div>
        </>
    );
}
