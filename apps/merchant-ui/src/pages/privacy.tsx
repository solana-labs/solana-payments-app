import { DefaultLayout } from '@/components/DefaultLayout';
import { PrivacyPolicyText } from '@/lib/policies';
import Head from 'next/head';

export default function Privacy() {
    return (
        <>
            <Head>
                <title>Solana Pay - Privacy Policy</title>
                <meta name="description" content="Privacy Policy" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <PrivacyPolicyText />
                </DefaultLayout>
            </div>
        </>
    );
}
