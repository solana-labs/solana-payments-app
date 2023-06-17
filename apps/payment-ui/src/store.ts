import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mobileReducer from './features/mobile/mobileSlice';
import notificationReducer from './features/notification/notificationSlice';
import paymentSessionReducer from './features/payment-session/paymentSessionSlice';
import paymentOptionsSlice from './features/payment-options/paymentOptionsSlice';
import walletReducer from './features/wallet/walletSlice';
import websocketReducer from './features/websocket/websocketSlice';
import paymentDetailsReducer from './features/payment-details/paymentDetailsSlice';
import geoReducer from './features/geo/geoSlice';
import envReucer from './features/env/envSlice';

export const store = configureStore({
    reducer: {
        mobile: mobileReducer,
        notification: notificationReducer,
        paymentSession: paymentSessionReducer,
        paymentOptions: paymentOptionsSlice,
        wallet: walletReducer,
        websocket: websocketReducer,
        paymentDetails: paymentDetailsReducer,
        geo: geoReducer,
        env: envReucer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
