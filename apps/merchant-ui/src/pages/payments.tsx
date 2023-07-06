import { DefaultLayout } from '@/components/DefaultLayout';
import { Payments as PaymentsScreen } from '@/components/Payments';
import { isFailed, isOk } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import Head from 'next/head';
import Router from 'next/router';

export default function Payments() {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);
    if (isFailed(merchantInfo)) {
        Router.push('/');
    }
    if (isOk(merchantInfo) && !merchantInfo.data.completed) {
        Router.push('/getting-started');
    }

    return (
        <>
            <Head>
                <title>Solana Pay - Payments</title>
                <meta name="description" content="View your payments" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full">
                    <PaymentsScreen />
                </DefaultLayout>
            </div>
        </>
    );
}
