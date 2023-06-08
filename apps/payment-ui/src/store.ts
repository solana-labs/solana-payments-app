import { configureStore, combineReducers } from '@reduxjs/toolkit';
import payReducer from './features/pay-tab/paySlice';
import mobileReducer from './features/mobile/mobileSlice';

export const store = configureStore({
    reducer: {
        pay: payReducer,
        mobile: mobileReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
