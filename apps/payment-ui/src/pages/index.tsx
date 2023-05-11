import Head from 'next/head';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import MainSection from '../components/MainSection';
import { MdArrowBack } from 'react-icons/md';

export default function Home() {
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
