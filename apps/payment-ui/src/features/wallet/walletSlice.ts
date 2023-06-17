import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import axios from 'axios';

interface WalletState {
    pubkey: string | null;
    usdcBalance: number | null;
    error: string | null;
    loading: boolean;
}

const initalState: WalletState = {
    pubkey: null,
    usdcBalance: null,
    error: null,
    loading: false,
};

type BalanceResponse = {
    pubkey: string | null;
    usdcBalance: number | null;
    error: string | null;
};

export const fetchWalletBalance = createAsyncThunk<BalanceResponse, string>(
    'wallet/fetchWalletBalance',
    async (pubkey, { getState }): Promise<BalanceResponse> => {
        const state = getState() as RootState;
        const backendUrl = state.env.backendUrl;

        if (backendUrl == null) {
            return {
                pubkey: null,
                usdcBalance: null,
                error: 'There is a fatal error with this app. Please contact the developer.',
            };
        }

        try {
            const url = `${backendUrl}/balance?pubkey=${pubkey}`;
            const response = await axios.get(url);
            const usdcBalance = response.data.usdcBalance;

            return {
                pubkey: pubkey,
                usdcBalance: usdcBalance,
                error: null,
            };
        } catch (error) {
            console.log(error);
        }

        return {
            pubkey: null,
            usdcBalance: null,
            error: 'There is a fatal error with this app. Please contact the developer.',
        };
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState: initalState,
    reducers: {
        setWalletConnected: (state, action: PayloadAction<string>) => {
            console.log(action.payload);
            state.pubkey = action.payload;
        },
        setWalletDisconnected: state => {
            console.log('DISCONNECTED WALLET');
            state.pubkey = null;
        },
        setWalletLoading: state => {
            state.loading = true;
        },
        stopWalletLoading: state => {
            state.loading = false;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchWalletBalance.pending, (state: WalletState) => {})
            .addCase(fetchWalletBalance.rejected, (state: WalletState) => {})
            .addCase(fetchWalletBalance.fulfilled, (state: WalletState, action: PayloadAction<BalanceResponse>) => {
                state.error = action.payload.error;
                state.pubkey = action.payload.pubkey;
                state.usdcBalance = action.payload.usdcBalance;
            });
    },
});

export const { setWalletDisconnected, setWalletConnected, setWalletLoading, stopWalletLoading } = walletSlice.actions;

export default walletSlice.reducer;

export const getIsWalletConnected = (state: RootState): boolean => state.wallet.pubkey != null;
export const getWalletPubkey = (state: RootState): string | null => state.wallet.pubkey;
export const getBalance = (state: RootState): number | null => state.wallet.usdcBalance;
export const getIsWalletError = (state: RootState): boolean => state.wallet.error != null;
export const getWalletError = (state: RootState): string | null => state.wallet.error;
export const getIsWalletLoading = (state: RootState): boolean => state.wallet.loading;
