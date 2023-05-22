import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

export type PaymentMethod = 'qr-code' | 'connect-wallet';

interface PayState {
    paymentMethod: PaymentMethod;
    paymentId: string | null;
    payerAccount: string | null;
    paymentDetails: PaymentDetails | null;
    payingToken: PayingToken;
}

interface PaymentDetails {
    merchantDisplayName: string;
    totalAmountUSDCDisplay: string;
    totalAmountFiatDisplay: string;
    cancelUrl: string | null;
    completed: boolean;
    redirectUrl: string | null;
}

export enum PayingToken {
    USDC = 'USDC',
    USDT = 'USDT',
    SOL = 'SOL',
}

const initialPaymentDetails: PaymentDetails = {
    merchantDisplayName: 'Loading...',
    totalAmountUSDCDisplay: 'Loading...',
    totalAmountFiatDisplay: 'Loading...',
    cancelUrl: null,
    completed: false,
    redirectUrl: null,
};

const initalState: PayState = {
    paymentMethod: 'connect-wallet',
    paymentId: null,
    payerAccount: null,
    paymentDetails: null,
    payingToken: PayingToken.USDC,
};

export const timerTick = createAsyncThunk<PaymentDetails | null, void>(
    'pay/timerTick',
    async (_, { getState }): Promise<PaymentDetails | null> => {
        const state = getState() as RootState;
        const paymentId = state.pay.paymentId;
        if (paymentId != null) {
            const response = await axios.get(
                `https://uj1ctqe20k.execute-api.us-east-1.amazonaws.com/payment-status?id=${paymentId}`
            );
            return {
                merchantDisplayName: response.data.paymentStatus.merchantDisplayName,
                totalAmountUSDCDisplay: response.data.paymentStatus.totalAmountUSDCDisplay,
                totalAmountFiatDisplay: response.data.paymentStatus.totalAmountFiatDisplay,
                cancelUrl: response.data.paymentStatus.cancelUrl,
                completed: response.data.paymentStatus.completed,
                redirectUrl: response.data.paymentStatus.redirectUrl,
            };
        } else {
            return null;
        }
    }
);

const paySlice = createSlice({
    name: 'pay',
    initialState: initalState,
    reducers: {
        setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.paymentMethod = action.payload;
        },
        setPayingToken: (state, action: PayloadAction<PayingToken>) => {
            state.payingToken = action.payload;
        },
        setPaymentId: (state, action: PayloadAction<string>) => {
            state.paymentId = action.payload;
        },
        setPayerAccount: (state, action: PayloadAction<string>) => {
            state.payerAccount = action.payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(timerTick.pending, (state: PayState) => {
                // Handle timerTick.pending if needed
            })
            .addCase(timerTick.rejected, (state: PayState) => {
                // Handle timerTick.rejected if needed
            })
            .addCase(timerTick.fulfilled, (state: PayState, action: PayloadAction<PaymentDetails | null>) => {
                state.paymentDetails = action.payload;
            });
    },
});

export const { setPaymentMethod, setPayingToken, setPaymentId } = paySlice.actions;

export default paySlice.reducer;

export const getPaymentMethod = (state: any): PaymentMethod => state.pay.paymentMethod;

export const getPayingToken = (state: any): PayingToken => state.pay.payingToken;

export const getPaymentId = (state: any): PayingToken => state.pay.paymentId;

export const getRedirectUrl = (state: any): string | null => state.pay.redirectUrl;

export const getPayerAccount = (state: any): string => state.pay.payerAccount;

export const getPaymentDetails = (state: RootState): PaymentDetails | null => state.pay.paymentDetails;
