import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../../store';

interface WalletState {
    usdcBalance: number | null;
    pointsBalance: number | null;
    error: string | null;
}

const initalState: WalletState = {
    usdcBalance: null,
    pointsBalance: null,
    error: null,
};

type BalanceResponse = {
    usdcBalance: number | null;
    pointsBalance: number | null;
    error: string | null;
};

export const fetchWalletBalance = createAsyncThunk<BalanceResponse, string>(
    'wallet/fetchWalletBalance',
    async (pubkey, { getState }): Promise<BalanceResponse> => {
        const state = getState() as RootState;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        try {
            if (backendUrl == null) {
                throw new Error('There is a fatal error with this app. Please contact the developer.');
            }

            const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
            const response = await axios.get(`${backendUrl}/balance?publicKey=${pubkey}&mint=${USDC_MINT}`);
            let pointsBalance = 0;
            if (state.paymentDetails.loyaltyDetails?.pointsMint != null) {
                const pointsMint = state.paymentDetails.loyaltyDetails.pointsMint;
                const pointsBalanceResponse = await axios.get(
                    `${backendUrl}/balance?publicKey=${pubkey}&mint=${pointsMint}`
                );
                pointsBalance = pointsBalanceResponse.data.tokenBalance;
            }

            return {
                usdcBalance: response.data.tokenBalance,
                pointsBalance: pointsBalance,
                error: null,
            };
        } catch (error) {
            console.log(error);
            return {
                usdcBalance: null,
                pointsBalance: null,
                error: 'There is a fatal error with this app. Please contact the developer.',
            };
        }
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState: initalState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchWalletBalance.pending, (state: WalletState) => {})
            .addCase(fetchWalletBalance.rejected, (state: WalletState) => {})
            .addCase(fetchWalletBalance.fulfilled, (state: WalletState, action: PayloadAction<BalanceResponse>) => {
                state.error = action.payload.error;
                state.usdcBalance = action.payload.usdcBalance;
                state.pointsBalance = action.payload.pointsBalance;
            });
    },
});

export default walletSlice.reducer;

export const getBalance = (state: RootState): number | null => state.wallet.usdcBalance;
export const getPointsBalance = (state: RootState): number | null => state.wallet.pointsBalance;
export const getIsWalletError = (state: RootState): boolean => state.wallet.error != null;
export const getWalletError = (state: RootState): string | null => state.wallet.error;
