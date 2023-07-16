import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store';

export type PaymentMethod = 'qr-code' | 'connect-wallet';

export enum PayingToken {
    USDC = 'USDC',
    USDT = 'USDT',
    SOL = 'SOL',
}

interface PaymentOptionsState {
    paymentMethod: PaymentMethod;
    payingToken: PayingToken;
}

const initalState: PaymentOptionsState = {
    paymentMethod: 'connect-wallet',
    payingToken: PayingToken.USDC,
};

const paymentOptionsSlice = createSlice({
    name: 'paymentOptions',
    initialState: initalState,
    reducers: {
        setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.paymentMethod = action.payload;
        },
        setPayingToken: (state, action: PayloadAction<PayingToken>) => {
            state.payingToken = action.payload;
        },
    },
});

export const { setPaymentMethod, setPayingToken } = paymentOptionsSlice.actions;

export default paymentOptionsSlice.reducer;

export const getPaymentMethod = (state: RootState): PaymentMethod => state.paymentOptions.paymentMethod;

export const getPayingToken = (state: RootState): PayingToken => state.paymentOptions.payingToken;
