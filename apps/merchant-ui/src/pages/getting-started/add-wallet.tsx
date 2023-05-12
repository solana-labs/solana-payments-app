import Head from 'next/head';

import { DefaultLayout } from '@/components/DefaultLayout';
import { GettingStartedAddWallet } from '@/components/GettingStartedAddWallet';

export default function AddWallet() {
    return (
        <>
            <Head>
                <title>Solana Pay - Add a wallet</title>
                <meta name="description" content="Add a wallet" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <GettingStartedAddWallet />
                </DefaultLayout>
            </div>
        </>
    );
}
