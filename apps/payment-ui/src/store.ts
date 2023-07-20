import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './features/notification/notificationSlice';
import paymentDetailsReducer from './features/payment-details/paymentDetailsSlice';
import paymentOptionsSlice from './features/payment-options/paymentOptionsSlice';
import paymentSessionReducer from './features/payment-session/paymentSessionSlice';
import walletReducer from './features/wallet/walletSlice';
import websocketReducer from './features/websocket/websocketSlice';

export const store = configureStore({
    reducer: {
        notification: notificationReducer,
        paymentSession: paymentSessionReducer,
        paymentOptions: paymentOptionsSlice,
        wallet: walletReducer,
        websocket: websocketReducer,
        paymentDetails: paymentDetailsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
