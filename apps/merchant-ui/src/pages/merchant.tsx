import { DefaultLayout } from '@/components/DefaultLayout';
import Merchant404 from '@/components/Merchant404';
import { MerchantInfo } from '@/components/MerchantInfo';
import { isFailed, isOk } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import Head from 'next/head';
import Router from 'next/router';

export default function Merchant() {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    if (isFailed(merchantInfo)) {
        return <Merchant404 />;
    }

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
