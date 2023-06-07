import { DefaultLayout } from '@/components/DefaultLayout';
import { GettingStarted } from '@/components/GettingStarted';
import Head from 'next/head';

export default function GetStartedPage() {
    return (
        <>
            <Head>
                <title>Solana Pay - Get Started</title>
                <meta name="description" content="Get Started" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <GettingStarted />
                </DefaultLayout>
            </div>
        </>
    );
}
