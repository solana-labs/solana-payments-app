import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as web3 from '@solana/web3.js';
import { getPaymentId } from '@/features/payment-session/paymentSessionSlice';
import { buildPaymentTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import { AppDispatch } from '@/store';
import { setError } from '@/features/error/errorSlice';
import { sendMessage } from '@/features/payment-session/paymentSessionSlice';

const BuyButton = () => {
    const paymentId = useSelector(getPaymentId);
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState<boolean>(false);

    const fetchAndSendTransaction = async () => {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if ( paymentId == null ) {
            console.log('There is no payment.')
            dispatch(setError('There is no payment.'));
            return;
        }

        if (publicKey == null) {
            console.log('There is no wallet connected.')
            dispatch(setError('There is no wallet connected.'));
            return;
        }

        const transactionRequestEndpoint = buildPaymentTransactionRequestEndpoint(paymentId)

        let transactionString: string

        setLoading(true);

        try {

            const response = await axios.post(
                transactionRequestEndpoint,
                { account: publicKey },
                { headers: headers }
            );

            transactionString = response.data.transaction;
        } catch (error) {
            setLoading(false);
            dispatch(setError('There was an issue fetching your transaction. Please try again.'));
            return;
        }

        let transaction: web3.Transaction;

        try {
            
            const buffer = Buffer.from(transactionString, 'base64');
            transaction = web3.Transaction.from(buffer);

        } catch (error) {
            setLoading(false);
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
            setLoading(false);
            dispatch(setError('There was an issue sending your transaction. Please try again.'));
            return;
        }

        setLoading(false);

    };

    return (
        <button
            onClick={async () => {
                await fetchAndSendTransaction();
                // dispatch(sendMessage())
            }}
            className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg font-semibold flex justify-center items-center normal-case"
        >
            <div className='flex flex-row items-center justify-center'>
               { loading ? <span className="loading loading-spinner loading-sm mr-1" /> : <div /> }             
                <div className='ml-1'>Buy now</div>
            </div>
        </button>
    );
};

export default BuyButton;
