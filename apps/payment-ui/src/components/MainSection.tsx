import React from "react";
import DisplaySection from "./DisplaySection";
import CheckoutSection from "./CheckoutSection";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { useEffect } from "react";
import { useRouter } from 'next/router';
import { getPaymentId, setPaymentId } from "@/features/pay-tab/paySlice";


const MainSection = () => {

  const router = useRouter();

  if (!router.isReady) {
    return <div>Loading...</div>;
  }

  const dispatch = useDispatch<AppDispatch>();
  const paymentId = useSelector(getPaymentId)
  const { payment_id } = router.query

  useEffect(() => {
    const paymentId = payment_id as string
    // TODO: validate paymentId
    dispatch(setPaymentId(paymentId))
  }, [dispatch, paymentId]);

  return (
    <div className="flex flex-col h-[100vh] w-full max-w-2xl mx-auto">
      <DisplaySection />
      <CheckoutSection />
    </div>
  );
};

export default MainSection;
