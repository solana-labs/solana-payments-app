import { configureStore, combineReducers } from '@reduxjs/toolkit';
import payReducer from './features/pay-tab/paySlice';

export const store = configureStore({
    reducer: {
        pay: payReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
