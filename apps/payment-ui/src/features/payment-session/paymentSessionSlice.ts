import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';
import WebSocket from 'ws';
import { stat } from 'fs';
import { SocketConnectedWithoutPaymentIdError } from '@/errors/socket-connected-without-payment-id.error';
import { PaymentDetailsMessageWithoutDetailsError } from '@/errors/payment-details-message-without-details.error';
import { SocketMessageWithNoTypeError } from '@/errors/socket-message-with-no-type.error';

export enum SessionState {
    start,
    readyToConnect,
    closed,
    connected,
    processing,
    completed,
    error,
}

export enum MergedState {
    start,
    submitting,
    approving,
    processing,
    completing,
    laggedCompleting,
}

export enum SolanaPayState {
    start,
    transactionRequestStarted,
    transactionDelivered,
    processing,
    completed,
    solanaPayCompleted,
}

export enum TransactionRequestState {
    started,
    delivered,
    failed,
}

export enum ConnectWalletState {
    start,
    loading,
    sentTransaction,
    processing,
    completed,
}

export interface ErrorDetails {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
}

interface PaymentSessionState {
    pubkey: string | null;
    usdcBalance: number | null;
    paymentId: string | null;
    sessionState: SessionState;
    paymentDetails: PaymentDetails | null;
    redirectUrl: string | null;
    errorDetails: ErrorDetails | null;
    solanaPayState: SolanaPayState;
    connectWalletState: ConnectWalletState;
    transactionRequestState: TransactionRequestState;
    mergedState: MergedState;
}

const initalState: PaymentSessionState = {
    pubkey: null,
    usdcBalance: null,
    paymentId: null,
    sessionState: SessionState.start,
    paymentDetails: null,
    redirectUrl: null,
    errorDetails: null,
    solanaPayState: SolanaPayState.start,
    connectWalletState: ConnectWalletState.start,
    transactionRequestState: TransactionRequestState.started,
    mergedState: MergedState.start,
};

interface PaymentDetails {
    merchantDisplayName: string;
    totalAmountUSDCDisplay: string;
    totalAmountFiatDisplay: string;
    cancelUrl: string | null;
    completed: boolean;
    redirectUrl: string | null;
}

type BalanceResponse = {
    pubkey: string;
    usdcBalance: number;
    error: string | null;
};

interface CompletedDetails {
    redirectUrl: string;
}

type SocketConnectedResponse = { paymentDetails: PaymentDetails | null; error: ErrorDetails | null };
type PaymentDetailsSocketMessageResponse = { error: unknown | null };
type PaymentDetailsSocketMessageInfo = { paymentDetails: PaymentDetails };
type SocketMessageResponse = { paymentDetails: PaymentDetails | null; error: unknown | null };
type SocketMessage = { paymentDetails: PaymentDetails | null };

export const setWalletConnected = createAsyncThunk<BalanceResponse, string>(
    'wallet/setWalletConnected',
    async (pubkey, { getState }): Promise<BalanceResponse> => {
        const state = getState() as RootState;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (backendUrl == null) {
            return {
                pubkey: pubkey,
                usdcBalance: 0,
                error: null,
            };
        }

        const url = `${backendUrl}/balance?pubkey=${pubkey}`;
        const response = await axios.get(url);
        const usdcBalance = response.data.usdcBalance;

        return {
            pubkey: pubkey,
            usdcBalance: usdcBalance,
            error: null,
        };
    }
);

export const socketConnected = createAsyncThunk<SocketConnectedResponse>(
    'paymentSession/socketConnected',
    async (_, { getState }): Promise<SocketConnectedResponse> => {
        const state = getState() as RootState;
        const paymentId = state.paymentSession.paymentId;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (paymentId == null) {
            return {
                paymentDetails: null,
                error: null,
            };
        }

        if (backendUrl == null) {
            return {
                paymentDetails: null,
                error: null,
            };
        }

        const url = `${backendUrl}/payment-status?paymentId=${paymentId}&language=en`;
        const response = await axios.get(url);
        const paymentStatusResponse = response.data.paymentStatus;
        const errorResponse = response.data.error;

        return {
            paymentDetails: paymentStatusResponse,
            error: errorResponse,
        };
    }
);

const paymentSessionSlice = createSlice({
    name: 'paymentSession',
    initialState: initalState,
    reducers: {
        setPaymentId: (state, action: PayloadAction<string>) => {
            state.paymentId = action.payload;
            state.sessionState = SessionState.readyToConnect;
        },
        setPaymentDetails: (state, action: PayloadAction<PaymentDetails>) => {
            state.paymentDetails = action.payload;
        },
        setProcessing: state => {
            state.sessionState = SessionState.processing;
            state.solanaPayState = SolanaPayState.processing;
            state.mergedState = MergedState.processing;
        },
        setFailedProcessing: state => {
            // What state gets us out of failed processing?
            // It'll likely be a timer that will set us back to readyToConnect
            // We should also show some kind of a message
        },
        setTransactionRequestStarted: state => {
            state.solanaPayState = SolanaPayState.transactionRequestStarted;
            state.mergedState = MergedState.submitting;
        },
        setTransactionRequestFailed: state => {
            state.transactionRequestState = TransactionRequestState.failed;
        },
        setTransactionDelivered: state => {
            state.solanaPayState = SolanaPayState.transactionDelivered;
            state.transactionRequestState = TransactionRequestState.delivered;
            state.mergedState = MergedState.approving;
        },
        setCompleted: (state, action: PayloadAction<CompletedDetails>) => {
            state.sessionState = SessionState.completed;
            state.redirectUrl = action.payload.redirectUrl;
            state.solanaPayState = SolanaPayState.completed;
            state.mergedState = MergedState.completing;
        },
        setErrorDetails: (state, action: PayloadAction<ErrorDetails>) => {
            state.errorDetails = action.payload;
        },
        setClosed: state => {
            // there's a chance we could want to do a short timer here.
            state.sessionState = SessionState.closed;
        },
        setReadyToConnect: state => {
            state.sessionState = SessionState.readyToConnect;
        },
        setSolanaPayCompleted: state => {
            state.solanaPayState = SolanaPayState.solanaPayCompleted;
            state.mergedState = MergedState.laggedCompleting;
        },
        setConnectWalletLoading: state => {
            state.connectWalletState = ConnectWalletState.loading;
        },
        setConnectWalletSentTransaction: state => {
            state.connectWalletState = ConnectWalletState.sentTransaction;
        },
        setConnectWalletStart: state => {
            state.connectWalletState = ConnectWalletState.start;
        },
        setInsufficientFunds: state => {
            // set some error state for insuffient funds
        },
        setCancelTransaction: state => {
            state.mergedState = MergedState.start;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(socketConnected.pending, (state: PaymentSessionState) => {})
            .addCase(socketConnected.rejected, (state: PaymentSessionState) => {})
            .addCase(
                socketConnected.fulfilled,
                (state: PaymentSessionState, action: PayloadAction<SocketConnectedResponse>) => {
                    state.errorDetails = action.payload.error;
                    state.paymentDetails = action.payload.paymentDetails;
                    state.sessionState = SessionState.connected;
                }
            )
            .addCase(setWalletConnected.pending, (state: PaymentSessionState) => {})
            .addCase(setWalletConnected.rejected, (state: PaymentSessionState) => {})
            .addCase(
                setWalletConnected.fulfilled,
                (state: PaymentSessionState, action: PayloadAction<BalanceResponse>) => {
                    state.pubkey = action.payload.pubkey;
                    state.usdcBalance = action.payload.usdcBalance;
                }
            );
    },
});

export const {
    setPaymentId,
    setPaymentDetails,
    setProcessing,
    setFailedProcessing,
    setCompleted,
    setErrorDetails,
    setClosed,
    setReadyToConnect,
    setTransactionRequestStarted,
    setTransactionDelivered,
    setSolanaPayCompleted,
    setConnectWalletLoading,
    setConnectWalletSentTransaction,
    setConnectWalletStart,
    setTransactionRequestFailed,
    setInsufficientFunds,
    setCancelTransaction,
} = paymentSessionSlice.actions;

export default paymentSessionSlice.reducer;

export const getPaymentDetails = (state: RootState): PaymentDetails | null => state.paymentSession.paymentDetails;
export const getErrorDetails = (state: RootState): ErrorDetails | null => state.paymentSession.errorDetails;

export const getSessionState = (state: RootState): SessionState => state.paymentSession.sessionState;
export const getPaymentId = (state: RootState): string | null => state.paymentSession.paymentId;
export const getRedirectUrl = (state: RootState): string | null => state.paymentSession.redirectUrl;
export const getSolanaPayState = (state: RootState): SolanaPayState => state.paymentSession.solanaPayState;
export const getConnectWalletState = (state: RootState): ConnectWalletState => state.paymentSession.connectWalletState;
export const getMergedState = (state: RootState): MergedState => state.paymentSession.mergedState;

export const getIsProcessing = (state: RootState): boolean =>
    state.paymentSession.sessionState === SessionState.processing;
export const getIsCompleted = (state: RootState): boolean => state.paymentSession.redirectUrl != null;
export const getIsSolanaPayCompleted = (state: RootState): boolean =>
    state.paymentSession.solanaPayState === SolanaPayState.solanaPayCompleted;
export const getIsError = (state: RootState): boolean => state.paymentSession.errorDetails != null;
