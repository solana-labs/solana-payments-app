import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MainSection from "../components/MainSection";
import { MdArrowBack } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { useEffect } from "react";
import { useRouter } from 'next/router';
import { setPaymentId } from "@/features/pay-tab/paySlice";

export default function Home() {

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { id } = router.query

  useEffect(() => {
    const paymentId = id as string
    // TODO: validate paymentId
    dispatch(setPaymentId(paymentId))
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
