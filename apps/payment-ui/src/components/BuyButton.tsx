import React, { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { web3 } from '@project-serum/anchor';
import { getPaymentId } from '@/features/pay-tab/paySlice';
import { buildPaymentTransactionRequestEndpoint } from '@/utility/endpoints.utility';

const BuyButton = () => {
    const paymentId = useSelector(getPaymentId);
    const { publicKey, sendTransaction, signTransaction } = useWallet();

    const fetchAndSendTransaction = async () => {
        const headers = {
            'Content-Type': 'application/json',
        };

        // TODO: FIX THIS AND MAKE IT NICER AND CLEANER
        if (paymentId != null) {
            const response = await axios.post(
                buildPaymentTransactionRequestEndpoint(paymentId),
                { account: publicKey ? publicKey.toBase58() : '' },
                { headers: headers }
            );

            const buffer = Buffer.from(response.data.transaction, 'base64');

            const transaction = web3.Transaction.from(buffer);
            // TODO: Use default RPC from wallet adapter
            const connection = new web3.Connection(
                'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
            );
            await sendTransaction(transaction, connection);
        } else {
            console.log('NULL BOI LIL BOI');
        }
    };

    return (
        <button
            onClick={async () => {
                await fetchAndSendTransaction();
            }}
            className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg font-semibold flex justify-center items-center"
        >
            Buy Now
        </button>
    );
};

export default BuyButton;
