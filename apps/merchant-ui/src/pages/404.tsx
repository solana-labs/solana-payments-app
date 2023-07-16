import * as Button from '@/components/Button';
import { DefaultLayout } from '@/components/DefaultLayout';
import { isOk } from '@/lib/Result';
import { useMerchantStore } from '@/stores/merchantStore';
import Head from 'next/head';
import Router from 'next/router';

export default function Custom404() {
    const merchantInfo = useMerchantStore(state => state.merchantInfo);

    return (
        <>
            <Head>
                <title>Solana Pay - 404</title>
                <meta name="description" content="404 page" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full ">
                    <div className="flex flex-col justify-center h-full items-center mt-4 text-center space-y-12">
                        <h1 className="text-3xl font-semibold mt-2">We can&apos;t find that page</h1>
                        {isOk(merchantInfo) && merchantInfo.data.completed ? (
                            <Button.Primary onClick={() => Router.push('/merchant')} className="w-max">
                                Go to Dashboard
                            </Button.Primary>
                        ) : (
                            <Button.Primary onClick={() => Router.push('/')} className="w-max">
                                Sign In
                            </Button.Primary>
                        )}
                    </div>
                </DefaultLayout>
            </div>
        </>
    );
}
