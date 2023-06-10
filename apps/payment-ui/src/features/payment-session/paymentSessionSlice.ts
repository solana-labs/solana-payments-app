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
    connected,
    sendMessage,
}

interface PaymentSessionState {
    paymentId: string | null;
    sessionState: SessionState;
    paymentDetails: PaymentDetails | null;
}

const initalState: PaymentSessionState = {
    paymentId: null,
    sessionState: SessionState.start,
    paymentDetails: null,
};

interface PaymentDetails {
    merchantDisplayName: string;
    totalAmountUSDCDisplay: string;
    totalAmountFiatDisplay: string;
    cancelUrl: string | null;
    completed: boolean;
    redirectUrl: string | null;
}

type SocketConnectedResponse = { paymentDetails: PaymentDetails | null; error: unknown | null };
type PaymentDetailsSocketMessageResponse = { error: unknown | null };
type PaymentDetailsSocketMessageInfo = { paymentDetails: PaymentDetails };
type SocketMessageResponse = { paymentDetails: PaymentDetails | null; error: unknown | null };
type SocketMessage = { paymentDetails: PaymentDetails | null };

export const socketConnected = createAsyncThunk<SocketConnectedResponse>(
    'paymentSession/socketConnected',
    async (_, { getState }): Promise<SocketConnectedResponse> => {
        const state = getState() as RootState;
        const paymentId = state.paymentSession.paymentId;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (paymentId == null) {
            return {
                paymentDetails: null,
                error: new SocketConnectedWithoutPaymentIdError(),
            };
        }

        if (backendUrl == null) {
            return {
                paymentDetails: null,
                error: new Error('NEXT_PUBLIC_BACKEND_URL is not set'),
            };
        }

        const url = `${backendUrl}/payment-status?paymentId=${paymentId}&language=en`;
        const response = await axios.get(url);
        const paymentStatusResponse = response.data.paymentStatus;
        const errorResponse = response.data.error;

        return {
            paymentDetails: paymentStatusResponse,
            error: null,
        };
    }
);

// export const socketMessage = createAsyncThunk<SocketMessageResponse, SocketMessage>(
//     'paymentSession/socketMessage',
//     async (socketMessage: SocketMessage, { getState }): Promise<SocketMessageResponse> => {
//         const state = getState() as RootState;
//         return socketMessage;
//     }
// );

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
        sendMessage: state => {
            state.sessionState = SessionState.sendMessage;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(socketConnected.pending, (state: PaymentSessionState) => {})
            .addCase(socketConnected.rejected, (state: PaymentSessionState) => {})
            .addCase(
                socketConnected.fulfilled,
                (state: PaymentSessionState, action: PayloadAction<SocketConnectedResponse>) => {
                    // const error = action.payload.error;

                    // if (error != null && error instanceof SocketConnectedWithoutPaymentIdError) {
                    //     // set state that would force looking for the payment id or something
                    // } else if (error != null && error instanceof SocketMessageWithNoTypeError) {
                    //     // set state
                    // }

                    console.log(action.payload.paymentDetails);

                    state.paymentDetails = action.payload.paymentDetails;
                    state.sessionState = SessionState.connected;
                }
            );
    },
});
export const { setPaymentId, setPaymentDetails, sendMessage } = paymentSessionSlice.actions;

export default paymentSessionSlice.reducer;

export const getSessionState = (state: RootState): SessionState => state.paymentSession.sessionState;
export const getPaymentDetails = (state: RootState): PaymentDetails | null => state.paymentSession.paymentDetails;
