import React, { useEffect } from "react";
import { Wallet } from "./Wallet";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppDispatch } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentMethod } from "@/features/pay-tab/paySlice";
import axios from "axios";
import { send } from "process";
import { web3 } from "@project-serum/anchor";
import { getPaymentId } from "@/features/pay-tab/paySlice";
// import { fetchTransaction } from "@/features/pay-tab/paySlice";

const BuyButton = () => {

  const dispatch = useDispatch<AppDispatch>();
  const paymentId = useSelector(getPaymentId)
  const { publicKey, sendTransaction } = useWallet();

  const fetchAndSendTransaction = async () => {
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }

    // TODO: FIX THIS AND MAKE IT NICER AND CLEANER
    if ( paymentId != null ) {
      const response = await axios.post(
        `https://uj1ctqe20k.execute-api.us-east-1.amazonaws.com/payment-transaction?paymentId=${paymentId}`,
        { account: publicKey ? publicKey.toBase58() : '' },
        { headers: headers }
      )
  
      const buffer = Buffer.from(response.data.transaction, 'base64')
  
      const transaction = web3.Transaction.from( buffer )
      const connection = new web3.Connection('https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e')
      await sendTransaction(transaction, connection)
    } else {
      console.log('NULL BOI LIL BOI')
    }

  }


  return (
    <button onClick={async () => { await fetchAndSendTransaction() }} className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg font-semibold flex justify-center items-center">
      Buy Now
    </button>
  );
};

export default BuyButton;
