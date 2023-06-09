import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface ErrorState {
    error: string | null;
}

const initalState: ErrorState = {
    error: null,
};

const paySlice = createSlice({
    name: 'pay',
    initialState: initalState,
    reducers: {
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        removeError: state => {
            state.error = null;
        },
    },
});

export const { setError, removeError } = paySlice.actions;

export default paySlice.reducer;

export const getError = (state: RootState): string | null => state.error.error;
