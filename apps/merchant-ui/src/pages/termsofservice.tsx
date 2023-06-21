import { DefaultLayout } from '@/components/DefaultLayout';
import { TosText } from '@/lib/policies';
import Head from 'next/head';

export default function TermsOfService() {
    return (
        <>
            <Head>
                <title>Solana Pay - Terms of Service</title>
                <meta name="description" content="Terms of Service" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <TosText />
                </DefaultLayout>
            </div>
        </>
    );
}
