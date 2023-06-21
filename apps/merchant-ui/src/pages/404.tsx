import * as Button from '@/components/Button';
import { DefaultLayout } from '@/components/DefaultLayout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Custom404() {
    const router = useRouter();
    return (
        <>
            <Head>
                <title>Solana Pay - 404</title>
                <meta name="description" content="404 page" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full ">
                    <div className="flex flex-col justify-center h-full items-center mt-4 text-center space-y-12">
                        <h1 className="text-3xl font-semibold mt-2">We can't find that page</h1>
                        <Button.Primary onClick={() => router.push('/merchant')} className="w-max">
                            Go to dashboard
                        </Button.Primary>
                    </div>
                </DefaultLayout>
            </div>
        </>
    );
}
