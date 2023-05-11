import Head from 'next/head';

import { DefaultLayout } from '@/components/DefaultLayout';
import { MerchantInfo } from '@/components/MerchantInfo';

export default function Merchant() {
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
