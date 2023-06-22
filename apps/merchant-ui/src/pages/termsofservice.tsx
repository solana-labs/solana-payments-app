import { DefaultLayout } from '@/components/DefaultLayout';
import { DefaultLayoutContent } from '@/components/DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from '@/components/DefaultLayoutScreenTitle';
import { PdfViewer } from '@/components/PdfViewer';
import Head from 'next/head';

const title = 'Terms of Service';

export default function TermsOfService() {
    return (
        <>
            <Head>
                <title>Solana Pay - {title}</title>
                <meta name="description" content={title} />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout className="h-full w-full">
                    <DefaultLayoutContent>
                        <DefaultLayoutScreenTitle>{title}</DefaultLayoutScreenTitle>
                        <PdfViewer title={'Terms of Service'} />
                    </DefaultLayoutContent>
                </DefaultLayout>
            </div>
        </>
    );
}
