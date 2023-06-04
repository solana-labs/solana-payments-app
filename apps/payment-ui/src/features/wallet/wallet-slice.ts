import { createSlice } from '@reduxjs/toolkit';

interface WalletState {
    address: string;
    connected: boolean;
}

const walletSlice = createSlice({
    name: 'pay',
    initialState: {
        address: '',
        connected: false,
    },
    reducers: {
        setWallet: (state, action: PayloadAction<string>) => {
            state.paymentMethod = action.payload;
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
