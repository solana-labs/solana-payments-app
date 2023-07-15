import * as Button from '@/components/Button';
import { DefaultLayout } from '@/components/DefaultLayout';
import Head from 'next/head';
import Router from 'next/router';

export default function Merchant404() {
    return (
        <>
            <Head>
                <title>Solana Pay - 404</title>
                <meta name="description" content="404 page" />
            </Head>
            <div className="h-screen w-screen">
                <DefaultLayout accountIsActive className="h-full w-full ">
                    <div className="flex flex-col justify-center h-full items-center mt-4 text-center space-y-12">
                        <h1 className="text-3xl font-semibold mt-2">We can&apos;t find that merchant</h1>
                        <Button.Primary onClick={() => Router.push('/')} className="w-max">
                            Sign In
                        </Button.Primary>
                    </div>
                </DefaultLayout>
            </div>
        </>
    );
}
