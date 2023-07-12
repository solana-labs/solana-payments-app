import { RootState } from '@/store';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export enum PaymentDetailsStatus {
    new = 'new',
    fresh = 'fresh',
    stale = 'stale',
}

export interface PaymentDetails {
    merchantDisplayName: string;
    totalAmountFiatDisplay: string;
    usdcSize: number;
    cancelUrl: string;
    redirectUrl: string | null;
    completed: boolean;
}

export interface ErrorDetails {
    errorTitle: string;
    errorDetail: string;
    errorRedirect: string | null;
}

export interface PaymentDetailsState {
    paymentId: string | null;
    status: PaymentDetailsStatus;
    paymentDetails: PaymentDetails | null;
    errorDetails: ErrorDetails | null;
}

export interface PaymentDetailsResponse {
    paymentDetails: PaymentDetails | null;
    errorDetails: ErrorDetails | null;
}

const initalState: PaymentDetailsState = {
    paymentId: null,
    status: PaymentDetailsStatus.new,
    paymentDetails: null,
    errorDetails: null,
};

const paymentDetailsSlice = createSlice({
    name: 'paymentDetails',
    initialState: initalState,
    reducers: {
        setPaymentId: (state, action: PayloadAction<string>) => {
            state.paymentId = action.payload;
        },
        setRedirectUrl: (state, action: PayloadAction<string>) => {
            if (state.paymentDetails) {
                state.paymentDetails.redirectUrl = action.payload;
            }
        },
        setErrorDetails: (state, action: PayloadAction<ErrorDetails>) => {
            state.errorDetails = action.payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPaymentDetails.pending, state => {})
            .addCase(fetchPaymentDetails.rejected, state => {})
            .addCase(
                fetchPaymentDetails.fulfilled,
                (state: PaymentDetailsState, action: PayloadAction<PaymentDetailsResponse>) => {
                    state.status = PaymentDetailsStatus.fresh;
                    state.paymentDetails = action.payload.paymentDetails;
                    state.errorDetails = action.payload.errorDetails;
                }
            );
    },
});

export const { setPaymentId, setRedirectUrl } = paymentDetailsSlice.actions;

export default paymentDetailsSlice.reducer;

export const getPaymentId = (state: RootState): string | null => state.paymentDetails.paymentId;
export const getStatus = (state: RootState): PaymentDetailsStatus => state.paymentDetails.status;
export const shouldPaymentDetailsBeFetched = (state: RootState): boolean =>
    state.paymentDetails.status == PaymentDetailsStatus.new ||
    state.paymentDetails.status == PaymentDetailsStatus.stale;
export const getPaymentDetails = (state: RootState): PaymentDetails | null => state.paymentDetails.paymentDetails;
export const getErrorDetails = (state: RootState): ErrorDetails | null => state.paymentDetails.errorDetails;
export const getIsPaymentError = (state: RootState): boolean => state.paymentDetails.errorDetails != null;
export const getIsPaymentCompleted = (state: RootState): boolean =>
    state.paymentDetails.paymentDetails?.completed ?? false;
export const getPaymentSize = (state: RootState): number | null =>
    state.paymentDetails.paymentDetails ? state.paymentDetails.paymentDetails.usdcSize : null;
export const getPaymentRedirectUrl = (state: RootState): string | null =>
    state.paymentDetails.paymentDetails?.redirectUrl ?? null;

export const fetchPaymentDetails = createAsyncThunk<PaymentDetailsResponse>(
    'paymentDetails/fetchPaymentDetails',
    async (_, { getState }): Promise<PaymentDetailsResponse> => {
        const state = getState() as RootState;
        const paymentId = state.paymentDetails.paymentId;
        const backendUrl = state.env.backendUrl;

        if (backendUrl == null || paymentId == null) {
            return {
                paymentDetails: null,
                errorDetails: {
                    errorTitle: 'Internal Error',
                    errorDetail: 'There is a fatal error with this app. Please return back to Shopify.',
                    errorRedirect: null,
                },
            };
        }

        let paymentDetails: PaymentDetails | null;
        let errorDetails: ErrorDetails | null;

        try {
            const url = `${backendUrl}/payment-status?paymentId=${paymentId}&language=en`;
            const response = await axios.get(url);
            paymentDetails = response.data.paymentStatus;
            errorDetails = response.data.error;
        } catch (error) {
            return {
                // TODO: Figure something out other than crashing lol
                paymentDetails: null,
                errorDetails: null,
            };
        }

        return {
            paymentDetails: paymentDetails,
            errorDetails: errorDetails,
        };
    }
);
