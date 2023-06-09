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
            dispatch(setError('There is no payment.'));
            return;
        }

        if (publicKey == null) {
            dispatch(setError('There is no wallet connected.'));
            return;
        }

        const transactionRequestEndpoint = buildPaymentTransactionRequestEndpoint(paymentId)

        let transactionString: string

        try {
            const response = await axios.post(
                transactionRequestEndpoint,
                { account: publicKey },
                { headers: headers }
            );

            transactionString = response.data.transaction;
        } catch (error) {
            dispatch(setError('There was an issue fetching your transaction. Please try again.'));
            return;
        }

        let transaction: web3.Transaction;

        try {
            
            const buffer = Buffer.from(transactionString, 'base64');
            transaction = web3.Transaction.from(buffer);

        } catch (error) {
            dispatch(setError('There was issue with your transaction. Please try again.'));
            return
        }

        try {
            // TODO: Use default RPC from wallet adapter
            const connection = new web3.Connection(
                'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
            );
            await sendTransaction(transaction, connection);
        } catch (error) {
            dispatch(setError('There was an issue sending your transaction. Please try again.'));
            return;
        }

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
