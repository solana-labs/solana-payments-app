import { getPaymentDetails, getRedirectUrl } from "@/features/pay-tab/paySlice";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const RedirectHandler = () => {
    const paymentDetails = useSelector(getPaymentDetails);
  
    useEffect(() => {
      if ( paymentDetails.redirectUrl != null ) {
        window.location.href = paymentDetails.redirectUrl;
      }
    }, [paymentDetails]);
  
    return null;
  };