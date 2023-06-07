import { Welcome } from '@/components/Welcome';
import { WelcomeHero } from '@/components/WelcomeHero';
import Head from 'next/head';
import { twMerge } from 'tailwind-merge';

export default function Home() {
    return (
        <>
            <Head>
                <title>Solana Pay Merchant Portal</title>
                <meta
                    name="description"
                    content="Solana Pay makes it easy for you to accept Solana and USDC payments on your Shopify site."
                />
            </Head>
            <div className={twMerge('grid', 'h-screen', 'w-screen', 'md:grid-cols-2')}>
                <div className="flex flex-col justify-center items-center px-6 md:px-24">
                    <Welcome className="pt-14 md:pt-0 md:mb-56 w-full max-w-md" />
                </div>
                <div className={twMerge('relative', 'h-full')}>
                    <WelcomeHero className={twMerge('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover')} />
                </div>
            </div>
        </>
    );
}
