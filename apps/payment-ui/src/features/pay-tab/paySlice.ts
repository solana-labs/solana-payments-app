import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

export type PaymentMethod = 'qr-code' | 'connect-wallet';

interface PayState {
    paymentMethod: PaymentMethod;
    paymentId: string | null;
    payerAccount: string | null;
    paymentDetails: PaymentDetails | null;
    paymentError: PayError | null;
    payingToken: PayingToken;
}

interface PayError {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string;
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

const initalState: PayState = {
    paymentMethod: 'connect-wallet',
    paymentId: null,
    payerAccount: null,
    paymentDetails: null,
    payingToken: PayingToken.USDC,
    paymentError: null,
};

export const timerTick = createAsyncThunk<{ details: PaymentDetails | null; error: PayError | null }, void>(
    'pay/timerTick',
    async (_, { getState }): Promise<{ details: PaymentDetails | null; error: PayError | null }> => {
        const state = getState() as RootState;
        const paymentId = state.pay.paymentId;

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
            const mockMerchantDisplayName = process.env.NEXT_PUBLIC_MOCK_MERCHANT_DISPLAY_NAME;
            const mockTotalUSDCDisplay = process.env.NEXT_PUBLIC_MOCK_TOTAL_USDC_DISPLAY;
            const mockTotalFiat = process.env.NEXT_PUBLIC_MOCK_TOTAL_FIAT;

            if (mockMerchantDisplayName != null && mockTotalUSDCDisplay != null && mockTotalFiat != null) {
                return {
                    details: {
                        merchantDisplayName: mockMerchantDisplayName,
                        totalAmountUSDCDisplay: mockTotalUSDCDisplay,
                        totalAmountFiatDisplay: mockTotalFiat,
                        cancelUrl: null,
                        completed: false,
                        redirectUrl: null,
                    },
                    error: null,
                };
            }

            if (backendUrl == null) {
                throw new Error('Backend URL is null');
            }

            if (paymentId == null) {
                throw new Error('Payment ID is null');
            }

            const url = `${backendUrl}/payment-status?paymentId=${paymentId}&language=en`;

            const response = await axios.get(url);

            const paymentStatusResponse = response.data.paymentStatus;
            const errorResponse = response.data.error;

            return {
                details: {
                    merchantDisplayName: paymentStatusResponse.merchantDisplayName,
                    totalAmountUSDCDisplay: paymentStatusResponse.totalAmountUSDCDisplay,
                    totalAmountFiatDisplay: paymentStatusResponse.totalAmountFiatDisplay,
                    cancelUrl: paymentStatusResponse.cancelUrl,
                    completed: paymentStatusResponse.completed,
                    redirectUrl: paymentStatusResponse.redirectUrl,
                },
                error: errorResponse,
            };
        } catch (error) {
            console.log(error);

            return {
                details: null,
                error: null,
            };
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
            .addCase(
                timerTick.fulfilled,
                (
                    state: PayState,
                    action: PayloadAction<{ details: PaymentDetails | null; error: PayError | null }>
                ) => {
                    state.paymentDetails = action.payload.details;
                    state.paymentError = action.payload.error;
                }
            );
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

export const getPaymentErrors = (state: RootState): PayError | null => state.pay.paymentError;
