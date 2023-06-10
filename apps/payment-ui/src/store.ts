import { configureStore, combineReducers } from '@reduxjs/toolkit';
import payReducer from './features/pay-tab/paySlice';
import mobileReducer from './features/mobile/mobileSlice';
import errorReducer from './features/error/errorSlice';
import paymentSessionReducer from './features/payment-session/paymentSessionSlice';

export const store = configureStore({
    reducer: {
        pay: payReducer,
        mobile: mobileReducer,
        error: errorReducer,
        paymentSession: paymentSessionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
