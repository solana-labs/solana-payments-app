import {
    Notification,
    NotificationType,
    getConnectWalletNotification,
    setNotification,
} from '@/features/notification/notificationSlice';
import { getPaymentId } from '@/features/payment-details/paymentDetailsSlice';
import { resetSession } from '@/features/payment-session/paymentSessionSlice';
import { getIsWalletLoading, setWalletLoading, stopWalletLoading } from '@/features/wallet/walletSlice';
import { AppDispatch } from '@/store';
import { buildTransactionRequestEndpoint } from '@/utility/endpoints.utility';
import { useWallet } from '@solana/wallet-adapter-react';
import * as web3 from '@solana/web3.js';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';

const BuyButton = () => {
    const paymentId = useSelector(getPaymentId);
    const { publicKey, sendTransaction, signTransaction } = useWallet();
    const dispatch = useDispatch<AppDispatch>();
    const connectedWalletNotification = useSelector(getConnectWalletNotification);
    const isLoading = useSelector(getIsWalletLoading);

    const fetchAndSendTransaction = async () => {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (paymentId == null) {
            dispatch(setNotification({ notification: Notification.noPayment, type: NotificationType.connectWallet }));
            return;
        }

        if (publicKey == null) {
            dispatch(setNotification({ notification: Notification.noWallet, type: NotificationType.connectWallet }));
            return;
        }

        const transactionRequestEndpoint = buildTransactionRequestEndpoint(paymentId);

        let transactionString: string;

        dispatch(setWalletLoading());

        try {
            const response = await axios.post(transactionRequestEndpoint, { account: publicKey }, { headers: headers });

            transactionString = response.data.transaction;
        } catch (error) {
            dispatch(stopWalletLoading());
            dispatch(resetSession());
            dispatch(
                setNotification({
                    notification: Notification.transactionRequestFailed,
                    type: NotificationType.connectWallet,
                })
            );
            return;
        }

        if (transactionString == null) {
            dispatch(stopWalletLoading());
            dispatch(resetSession());
            dispatch(
                setNotification({
                    notification: Notification.transactionRequestFailed,
                    type: NotificationType.connectWallet,
                })
            );
            return;
        }

        let transaction: web3.Transaction;

        try {
            const buffer = Buffer.from(transactionString, 'base64');
            transaction = web3.Transaction.from(buffer);
        } catch (error) {
            dispatch(stopWalletLoading());
            dispatch(resetSession());
            dispatch(
                setNotification({
                    notification: Notification.transactionRequestFailed,
                    type: NotificationType.connectWallet,
                })
            );
            return;
        }

        try {
            // TODO: Use default RPC from wallet adapter
            const connection = new web3.Connection(
                'https://rpc.helius.xyz/?api-key=5f70b753-57cb-422b-a018-d7df67b4470e'
            );
            await sendTransaction(transaction, connection);
        } catch (error) {
            const declined = error instanceof Error && error.message.toLowerCase().includes('user rejected');
            const duplicatePayment =
                error instanceof Error &&
                error.message.toLowerCase().includes('0x0') &&
                error.message.toLowerCase().includes('instruction 0');
            const insufficientFunds =
                error instanceof Error &&
                error.message.toLowerCase().includes('0x1') &&
                error.message.toLowerCase().includes('instruction 1');

            if (declined) {
                // The most important check, we can't detect this any other way
                dispatch(
                    setNotification({ notification: Notification.declined, type: NotificationType.connectWallet })
                );
            } else if (duplicatePayment) {
                // Could also be handled by a transaction simulation webhook message
                dispatch(
                    setNotification({
                        notification: Notification.duplicatePayment,
                        type: NotificationType.connectWallet,
                    })
                );
            } else if (insufficientFunds) {
                // Shouldn't happen. We shouldn't let them submit a transaction if they don't have enough funds.
                dispatch(
                    setNotification({
                        notification: Notification.insufficentFunds,
                        type: NotificationType.connectWallet,
                    })
                );
            } else {
                dispatch(
                    setNotification({
                        notification: Notification.simulatingIssue,
                        type: NotificationType.connectWallet,
                    })
                );
            }

            dispatch(resetSession());
            dispatch(stopWalletLoading());
            return;
        }
    };

    const isDisabled = () => {
        if (connectedWalletNotification == Notification.insufficentFunds) {
            return true;
        } else if (paymentId == null) {
            return true;
        } else if (isLoading) {
            return true;
        }
    };

    return (
        <button
            disabled={isDisabled()}
            onClick={async () => {
                await fetchAndSendTransaction();
            }}
            className="btn w-full bg-black text-white py-4 pt-3 text-base rounded-md shadow-lg disabled:shadow-none font-semibold flex justify-center items-center normal-case disabled:bg-slate-200 disabled:text-slate-400"
        >
            <div className={`flex flex-row items-center justify-center`}>
                {isLoading ? <span className="loading loading-spinner loading-sm mr-1" /> : <div />}
                <div className="ml-1">Buy now</div>
            </div>
        </button>
    );
};

export default BuyButton;
