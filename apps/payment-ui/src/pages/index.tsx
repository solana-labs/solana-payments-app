import Head from 'next/head';
import MainSection from '../components/MainSection';
import { GetServerSideProps, GetServerSidePropsContext } from 'next'


export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const { query } = context;

    return {
        props: query,
    }
}

export type BlockedProps = {
    isBlocked: string;
};
  

export default function Home({
    isBlocked
  }: BlockedProps) {

    return (
        <div>
            <Head>
                <title>{'Solana Pay'}</title>
            </Head>
            <div className="min-h-screen bg-black flex flex-col justify-between items-center">
                <div className="w-full flex-grow flex items-end">
                    <MainSection isBlocked={isBlocked} />
                </div>
            </div>
        </div>
    );
}
