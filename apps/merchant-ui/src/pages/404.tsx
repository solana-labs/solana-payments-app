import { DefaultLayout } from '@/components/DefaultLayout';
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

export default function Custom404({ isBlocked, country }: BlockedProps) {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    if (isOk(merchantInfo) && !merchantInfo.data.completed) {
        Router.push('/getting-started');
    }
    return (
        <>
            <Head>
                <title>Solana Pay - 404</title>
                <meta name="description" content="404 page" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full ">
                    <div className="flex flex-col justify-center h-full ">
                        <div className="mt-4 text-center">
                            <h1 className="text-2xl font-semibold">404</h1>
                            <p className="text-lg  mt-2">Page not found</p>
                        </div>
                    </div>
                </DefaultLayout>
            </div>
        </>
    );
}
