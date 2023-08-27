import { Welcome } from '@/components/Welcome';
import { WelcomeHero } from '@/components/WelcomeHero';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { twMerge } from 'tailwind-merge';

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    };
};

export type BlockedProps = {
    isBlocked: string;
    isLoggedIn: string;
    country: string;
};

export default function Home({ isBlocked, isLoggedIn, country }: BlockedProps) {
    return (
        <>
            <Head>
                <title>Solana Pay Merchant Portal</title>
                <meta
                    name="description"
                    content="Manage your Shopify Solana Store Payments and Refunds with Solana Pay."
                />
            </Head>
            <div className={twMerge('grid', 'h-screen', 'w-screen', 'md:grid-cols-2')}>
                <div className="flex flex-col justify-center items-center px-6 md:px-24">
                    <Welcome
                        className="pt-14 md:pt-0 md:mb-56 w-full max-w-md"
                        isBlocked={isBlocked}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
                <div className={twMerge('relative', 'h-full')}>
                    <WelcomeHero className={twMerge('absolute', 'inset-0', 'w-full', 'h-full', 'object-cover')} />
                </div>
            </div>
        </>
    );
}
