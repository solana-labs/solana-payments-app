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

export interface Product {
    id: string;
    name?: string;
    image?: string;
    active: boolean;
    mint?: string;
    merchantId: string;
}

interface Tier {
    id: string;
    name: string;
    threshold: number;
    discount: number;
    active: boolean;
    mint?: string;
    merchantId: string;
}

export interface LoyaltyDetails {
    loyaltyProgram: 'none' | 'points' | 'tiers';
    points: {
        pointsMint: string | null;
        pointsBack: number;
    };
    products: Product[];
    tiers: Tier[];
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
    loyaltyDetails: LoyaltyDetails | null;
    productDetails: Product[];
}

export interface PaymentDetailsResponse {
    paymentDetails: PaymentDetails | null;
    errorDetails: ErrorDetails | null;

    loyaltyDetails: LoyaltyDetails | null;
    productDetails: Product[];
}

const initalState: PaymentDetailsState = {
    paymentId: null,
    status: PaymentDetailsStatus.new,
    paymentDetails: null,
    errorDetails: null,
    loyaltyDetails: null,
    productDetails: [],
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
                    state.loyaltyDetails = action.payload.loyaltyDetails;
                    state.productDetails = action.payload.productDetails;
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

export const getLoyaltyDetails = (state: RootState): LoyaltyDetails | null => state.paymentDetails.loyaltyDetails;
export const getProductDetails = (state: RootState): Product[] => state.paymentDetails.productDetails;

export const fetchPaymentDetails = createAsyncThunk<PaymentDetailsResponse>(
    'paymentDetails/fetchPaymentDetails',
    async (_, { getState }): Promise<PaymentDetailsResponse> => {
        const state = getState() as RootState;
        const paymentId = state.paymentDetails.paymentId;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        try {
            if (backendUrl == null || paymentId == null) {
                throw new Error(
                    'There is a fatal error with this app. Missing env variables. Please return back to Shopify.'
                );
            }

            const url = `${backendUrl}/payment-status?paymentId=${paymentId}&language=en`;
            const response = await axios.get(url);
            console.log('got back the product detaisl', response.data.productDetails);
            return {
                paymentDetails: response.data.paymentStatus,
                errorDetails: response.data.error,
                loyaltyDetails: response.data.loyaltyDetails,
                productDetails: response.data.productDetails,
            };
        } catch (error) {
            return {
                paymentDetails: null,
                errorDetails: {
                    errorTitle: 'Internal Error',
                    errorDetail: 'There is a fatal error with this app. Internal Error. Please return back to Shopify.',
                    errorRedirect: null,
                },
                loyaltyDetails: null,
                productDetails: [],
            };
        }
    }
);
