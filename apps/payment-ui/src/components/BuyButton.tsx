import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import * as web3 from '@solana/web3.js';
import { ConnectWalletState, getConnectWalletState, setConnectWalletSentTransaction, setConnectWalletStart, setTransactionRequestStarted } from '@/features/payment-session/paymentSessionSlice';
import { buildPaymentTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import { AppDispatch } from '@/store';
import { getPaymentId } from '@/features/payment-details/paymentDetailsSlice';
import { Notification, NotificationType, getConnectWalletNotification, setNotification } from '@/features/notification/notificationSlice';
import { setWalletLoading, stopWalletLoading } from '@/features/wallet/walletSlice';

const BuyButton = () => {
    const paymentId = useSelector(getPaymentId);
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const dispatch = useDispatch<AppDispatch>();
    const connectWalletState = useSelector(getConnectWalletState)
    const connectedWalletNotification = useSelector(getConnectWalletNotification)

    const fetchAndSendTransaction = async () => {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if ( paymentId == null ) {
            dispatch(setNotification({ notification: Notification.noPayment, type: NotificationType.connectWallet }));
            return;
        }

        if (publicKey == null) {
            dispatch(setNotification({ notification: Notification.noWallet, type: NotificationType.connectWallet }));
            return;
        }

        const transactionRequestEndpoint = buildPaymentTransactionRequestEndpoint(paymentId)

        let transactionString: string

        dispatch(setWalletLoading())

        try {

            const response = await axios.post(
                transactionRequestEndpoint,
                { account: publicKey },
                { headers: headers }
            );

            transactionString = response.data.transaction
        } catch (error) {
            dispatch(stopWalletLoading())
            
            // TODO: Handle error and give more specific reason
            // dispatch(setNotification(Notification.transactionRequestFailed));
            return;
        }

        if ( transactionString == null ) {
            dispatch(stopWalletLoading())
            // dispatch(setNotification(Notification.transactionRequestFailed));
            return;
        }

        let transaction: web3.Transaction;

        try {
            
            const buffer = Buffer.from(transactionString, 'base64');
            transaction = web3.Transaction.from(buffer);

        } catch (error) {
            dispatch(stopWalletLoading())
            // dispatch(setNotification(Notification.transactionRequestFailed));
            return
        }

        try {
            // TODO: Use default RPC from wallet adapter
            const connection = new web3.Connection(
                'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
            );
            await sendTransaction(transaction, connection);
        } catch (error) {
            dispatch(stopWalletLoading())

            const declined = ( error instanceof Error && error.message.toLowerCase().includes('user rejected') )
            const duplicatePayment = ( error instanceof Error && error.message.toLowerCase().includes('0x0') && error.message.toLowerCase().includes('instruction 0'))
            const insufficientFunds = ( error instanceof Error && error.message.toLowerCase().includes('0x1') && error.message.toLowerCase().includes('instruction 1'))

            if (declined) {
                dispatch(setNotification({ notification: Notification.declined, type: NotificationType.connectWallet }));
            } else if (duplicatePayment) {
                // dispatch(setNotification(Notification.duplicatePayment));
            } else if (insufficientFunds) {
                // dispatch(setNotification(Notification.insufficentFunds));
            } else {
                // dispatch(setNotification(Notification.simulatingIssue));
            }
            

            return;
        }

        // dispatch(setConnectWalletSentTransaction())

    };

    const isDisabled = () => {
        if ( connectedWalletNotification == Notification.insufficentFunds ) {
            return true
        } else if ( paymentId == null ) {
            return true
        }
    }

    return (
        <button
            disabled={isDisabled()}
            onClick={async () => {
                await fetchAndSendTransaction();
            }}
            className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg disabled:shadow-none font-semibold flex justify-center items-center normal-case disabled:bg-slate-200 disabled:text-slate-400"
        >
            <div className={`flex flex-row items-center justify-center`}>
               { connectWalletState == ConnectWalletState.loading ? <span className="loading loading-spinner loading-sm mr-1" /> : <div /> }             
                <div className='ml-1'>Buy now</div>
            </div>
        </button>
    );
};

export default BuyButton;
