import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as web3 from '@solana/web3.js';
import { getPaymentId } from '@/features/pay-tab/paySlice';
import { buildPaymentTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import { AppDispatch } from '@/store';
import { setError } from '@/features/error/errorSlice';

const BuyButton = () => {
    const paymentId = useSelector(getPaymentId);
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const dispatch = useDispatch<AppDispatch>();

    const fetchAndSendTransaction = async () => {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if ( paymentId == null ) {
            // Send out an error toast
            return;
        }

        if (publicKey == null) {
            // Send out an error toast
            return;
        }

        const transactionRequestEndpoint = buildPaymentTransactionRequestEndpoint(paymentId)

        const response = await axios.post(
            transactionRequestEndpoint,
            { account: publicKey },
            { headers: headers }
        );

        const buffer = Buffer.from(response.data.transaction, 'base64');

        const transaction = web3.Transaction.from(buffer);
        // TODO: Use default RPC from wallet adapter
        const connection = new web3.Connection(
            'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
        );
        await sendTransaction(transaction, connection);
    };

    return (
        <button
            onClick={async () => {
                await fetchAndSendTransaction();
            }}
            className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg font-semibold flex justify-center items-center normal-case"
        >
            Buy Now
        </button>
    );
};

export default BuyButton;
