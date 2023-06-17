import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';
import WebSocket from 'ws';
import { stat } from 'fs';
import { SocketConnectedWithoutPaymentIdError } from '@/errors/socket-connected-without-payment-id.error';
import { PaymentDetailsMessageWithoutDetailsError } from '@/errors/payment-details-message-without-details.error';
import { SocketMessageWithNoTypeError } from '@/errors/socket-message-with-no-type.error';

/**
 * SessionState - The state of the payment session, agnostic to how the user is paying
 */

export enum SessionState {
    fresh, // fresh start, browser load, has no paymentId
    aware, // aware of the payment id, can start the fun stuff
    submitting, // payment has been requested
    approving, // payment has been delivered
    processing, // payment is being processed
    completing, // payment is done but we are flexing with a completing state for added rizz
    completed, // payment is done
    error, // payment had a terminal error
    blocked, // payment has been geo blocked, maybe get rid of this too
}

/**
 *
 * MergedState - The state of how they're paying, agnostic to the payment method
 *
 */

export enum MergedState {
    start,
    submitting,
    approving,
    processing,
    completing,
    completed,
    error,
}

/**
 *
 * SolanaPayState - The state of a user paying with SolanaPay
 *
 */

export enum SolanaPayState {
    start,
    transactionRequestStarted,
    transactionDelivered,
    processing,
    completed,
    solanaPayCompleted,
}

/**
 *
 * ConnectWalletState - The state of a user paying with a connected wallet
 *
 */

export enum ConnectWalletState {
    start,
    loading,
    submitting,
    approving,
    sentTransaction,
    processing,
    completed,
}

/**
 *
 * ConnectWalletState - The state of a user paying with a connected wallet
 *
 */

interface PaymentSessionState {
    pubkey: string | null;
    usdcBalance: number | null;
    sessionState: SessionState;
    redirectUrl: string | null;
    solanaPayState: SolanaPayState;
    connectWalletState: ConnectWalletState;
    mergedState: MergedState;
}

const initalState: PaymentSessionState = {
    pubkey: null,
    usdcBalance: null,
    sessionState: SessionState.fresh,
    redirectUrl: null,
    solanaPayState: SolanaPayState.start,
    connectWalletState: ConnectWalletState.start,
    mergedState: MergedState.start,
};

type BalanceResponse = {
    pubkey: string;
    usdcBalance: number;
    error: string | null;
};

interface CompletedDetails {
    redirectUrl: string;
}

// type SocketConnectedResponse = { paymentDetails: PaymentDetails | null; error: ErrorDetails | null };
// type PaymentDetailsSocketMessageResponse = { error: unknown | null };
// type PaymentDetailsSocketMessageInfo = { paymentDetails: PaymentDetails };
// type SocketMessageResponse = { paymentDetails: PaymentDetails | null; error: unknown | null };
// type SocketMessage = { paymentDetails: PaymentDetails | null };

const paymentSessionSlice = createSlice({
    name: 'paymentSession',
    initialState: initalState,
    reducers: {
        setPaymentId: (state, action: PayloadAction<string>) => {
            // I don't want any bias here
        },
        setProcessing: state => {
            state.mergedState = MergedState.processing;
        },
        setFailedProcessing: state => {
            // What state gets us out of failed processing?
            // It'll likely be a timer that will set us back to readyToConnect
            // We should also show some kind of a message
        },
        resetSession: state => {
            state.mergedState = MergedState.start;
            state.solanaPayState = SolanaPayState.start;
            state.connectWalletState = ConnectWalletState.start;
            state.sessionState = SessionState.fresh;
        },
        setTransactionRequestStarted: state => {
            state.solanaPayState = SolanaPayState.transactionRequestStarted;
            state.mergedState = MergedState.submitting;
            state.sessionState = SessionState.submitting;
            state.connectWalletState = ConnectWalletState.loading;
        },
        setTransactionRequestFailed: state => {
            // Do transaction request failing stuff here
        },
        setTransactionDelivered: state => {
            console.log('state should be set');
            // state.solanaPayState = SolanaPayState.transactionDelivered;
            state.mergedState = MergedState.approving;
            // state.sessionState = SessionState.approving;
            // state.connectWalletState = ConnectWalletState.approving;
        },
        setCompleted: state => {
            state.mergedState = MergedState.completed;
        },
        setCompleting: state => {
            state.mergedState = MergedState.completing;
        },
        setError: state => {
            state.mergedState = MergedState.error;
        },
        setClosed: state => {
            // there's a chance we could want to do a short timer here.
            // I think this is a websocket thing
        },
        setSolanaPayCompleted: state => {
            // I don't even know if I want this anymore
        },
        setConnectWalletSentTransaction: state => {
            // Probably want something like this still
        },
        setConnectWalletStart: state => {
            // Idk if i'm gonna want this anymore
        },
    },
});

export const {
    setPaymentId,
    setProcessing,
    setFailedProcessing,
    setCompleted,
    setCompleting,
    setClosed,
    setTransactionRequestStarted,
    setTransactionDelivered,
    setSolanaPayCompleted,
    setConnectWalletSentTransaction,
    setConnectWalletStart,
    setTransactionRequestFailed,
    resetSession,
    setError,
} = paymentSessionSlice.actions;

export default paymentSessionSlice.reducer;

export const getSessionState = (state: RootState): SessionState => state.paymentSession.sessionState;
export const getRedirectUrl = (state: RootState): string | null => state.paymentSession.redirectUrl;
export const getSolanaPayState = (state: RootState): SolanaPayState => state.paymentSession.solanaPayState;
export const getConnectWalletState = (state: RootState): ConnectWalletState => state.paymentSession.connectWalletState;
export const getMergedState = (state: RootState): MergedState => state.paymentSession.mergedState;

export const getIsProcessing = (state: RootState): boolean =>
    state.paymentSession.sessionState === SessionState.processing;
export const getIsCompleted = (state: RootState): boolean => state.paymentSession.mergedState === MergedState.completed;
export const getIsSolanaPayCompleted = (state: RootState): boolean =>
    state.paymentSession.solanaPayState === SolanaPayState.solanaPayCompleted;
export const getIsCompleting = (state: RootState): boolean =>
    state.paymentSession.mergedState === MergedState.completing;
