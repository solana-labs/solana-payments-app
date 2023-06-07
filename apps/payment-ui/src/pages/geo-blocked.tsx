import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import MainSection from '../components/MainSection';
import { MdArrowBack } from 'react-icons/md';
import { useEffect } from 'react';
import { setIsMobile } from '@/features/is-mobile/viewPortSlice';
import { setPaymentMethod } from '@/features/pay-tab/paySlice';
import { AppDispatch } from '@/store';
import { useDispatch } from 'react-redux';

export default function GeoBlocked() {

    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const handleResize = () => {
            dispatch(setIsMobile(window.innerWidth < 640));
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [dispatch]);

    return (
        <>
            <Head>
                <title>My App</title>
            </Head>
            <div className="min-h-screen bg-black flex flex-col justify-between items-center">
                <div className="w-full flex-grow flex items-end">
                    <MainSection />
                </div>
            </div>
        </>
    );
}
