import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mobileReducer from './features/mobile/mobileSlice';
import notificationReducer from './features/notification/notificationSlice';
import paymentSessionReducer from './features/payment-session/paymentSessionSlice';
import paymentOptionsSlice from './features/payment-options/paymentOptionsSlice';
import walletReducer from './features/wallet/walletSlice';

export const store = configureStore({
    reducer: {
        mobile: mobileReducer,
        notification: notificationReducer,
        paymentSession: paymentSessionReducer,
        paymentOptions: paymentOptionsSlice,
        wallet: walletReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
