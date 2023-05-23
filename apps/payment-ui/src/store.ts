import { configureStore, combineReducers } from '@reduxjs/toolkit';
import payReducer from './features/pay-tab/paySlice';
import viewportReducer from './features/is-mobile/viewPortSlice';

export const store = configureStore({
    reducer: {
        pay: payReducer,
        viewport: viewportReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
