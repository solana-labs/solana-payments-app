import { PaymentMethodTab } from "@/features/pay-tab/PaymentMethodTab";
import { getPaymentMethod } from "@/features/pay-tab/paySlice";
import { PayToLabel } from "@/features/pay-tab/PayToLabel";
import { AppDispatch } from "@/store";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import BuyButton from "./BuyButton";
import PayWithQRCodeSection from "./PayWithQRCodeSection";
import PayWithWalletSection from "./PayWithWalletSection";
import { QRCode } from "./QRCode";
import { createQR } from "./SolanaPayQRCode";
import WalletButton from "./WalletButton";

const CheckoutSection = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentMethod = useSelector(getPaymentMethod);

  return (
    <div className="w-full mx-auto rounded-t-xl bg-white flex flex-col justify-between sm:h-[95vh] h-[90vh] sm:px-16 pt-16 px-4">
      <div className="w-full flex flex-col">
        <div className="relative pb-8 flex-col hidden sm:flex">
          <PaymentMethodTab />
        </div>
        <div className="relative flex flex-col">
          <PayToLabel />
        </div>
      </div>
      <div className="relative flex flex-col h-full">
        {paymentMethod == "connect-wallet" ? (
          <PayWithWalletSection />
        ) : (
          <PayWithQRCodeSection />
        )}
      </div>
    </div>
  );
};

export default CheckoutSection;
