import Head from 'next/head';
import MainSection from '../components/MainSection';
import { useEffect } from 'react';
import { setIsMobile } from '@/features/is-mobile/viewPortSlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';

export default function Home() {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handleResize = () => {
            dispatch(setIsMobile(window.innerWidth < 640));
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    return (
        <>
            <Head>
                <title>Solana Pay</title>
            </Head>
            <div className="min-h-screen bg-black flex flex-col justify-between items-center">
                <div className="w-full flex-grow flex items-end">
                    <MainSection />
                </div>
            </div>
        </>
    );
}
