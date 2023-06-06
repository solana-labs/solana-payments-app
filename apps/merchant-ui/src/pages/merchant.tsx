import Head from 'next/head';
import Router from 'next/router';
import { useMerchantStore } from '@/stores/merchantStore';
import { DefaultLayout } from '@/components/DefaultLayout';
import { MerchantInfo } from '@/components/MerchantInfo';
import { isOk } from '@/lib/Result';

export default function Merchant() {
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
                    <MerchantInfo />
                </DefaultLayout>
            </div>
        </>
    );
}
