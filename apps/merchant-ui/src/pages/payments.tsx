import Head from 'next/head';

import { DefaultLayout } from '@/components/DefaultLayout';
import { Payments as PaymentsScreen } from '@/components/Payments';

export default function Payments() {
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
