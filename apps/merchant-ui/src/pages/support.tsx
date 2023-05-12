import Head from 'next/head';

import { DefaultLayout } from '@/components/DefaultLayout';
import { SupportFaq } from '@/components/SupportFaq';

export default function Support() {
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
