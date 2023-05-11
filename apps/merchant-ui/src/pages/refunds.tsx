import Head from 'next/head';

import { DefaultLayout } from '@/components/DefaultLayout';
import { Refunds } from '@/components/Refunds';

export default function RefundsPage() {
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
