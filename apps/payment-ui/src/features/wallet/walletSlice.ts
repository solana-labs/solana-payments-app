import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import axios from 'axios';

interface WalletState {
    pubkey: string | null;
    usdcBalance: string | null;
}

const initalState: WalletState = {
    pubkey: null,
    usdcBalance: null,
};

type BalanceResponse = {
    pubkey: string;
    usdcBalance: string;
    error: string | null;
};

export const setWalletConnected = createAsyncThunk<BalanceResponse, string>(
    'wallet/setWalletConnected',
    async (pubkey, { getState }): Promise<BalanceResponse> => {
        const state = getState() as RootState;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (backendUrl == null) {
            return {
                pubkey: pubkey,
                usdcBalance: '0',
                error: null,
            };
        }

        const url = `${backendUrl}/balance?pubkey=${pubkey}`;
        const response = await axios.get(url);
        const usdcBalance = response.data.usdcBalance;

        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);
        console.log('usdcBalance', usdcBalance);

        return {
            pubkey: pubkey,
            usdcBalance: usdcBalance,
            error: null,
        };
    }
);

const walletSlice = createSlice({
    name: 'wallet',
    initialState: initalState,
    reducers: {
        setWalletDisconnected: state => {
            state.pubkey = null;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(setWalletConnected.pending, (state: WalletState) => {})
            .addCase(setWalletConnected.rejected, (state: WalletState) => {})
            .addCase(setWalletConnected.fulfilled, (state: WalletState, action: PayloadAction<BalanceResponse>) => {
                state.pubkey = action.payload.pubkey;
                state.usdcBalance = action.payload.usdcBalance;
            });
    },
});

export const { setWalletDisconnected } = walletSlice.actions;

export default walletSlice.reducer;

export const getIsWalletConnected = (state: RootState): boolean => state.wallet.pubkey != null;
export const getWalletPubkey = (state: RootState): string | null => state.wallet.pubkey;
