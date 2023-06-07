import { DefaultLayout } from '@/components/DefaultLayout';
import { SupportFaq } from '@/components/SupportFaq';
import Head from 'next/head';

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
