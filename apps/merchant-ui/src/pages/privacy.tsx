import { DefaultLayout } from '@/components/DefaultLayout';
import { DefaultLayoutContent } from '@/components/DefaultLayoutContent';
import { DefaultLayoutScreenTitle } from '@/components/DefaultLayoutScreenTitle';
import { PdfViewer } from '@/components/PdfViewer';
import Head from 'next/head';

const title = 'Privacy Policy';

export default function Privacy() {
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
                        <PdfViewer title={'Privacy Policy'} />
                    </DefaultLayoutContent>
                </DefaultLayout>
            </div>
        </>
    );
}
