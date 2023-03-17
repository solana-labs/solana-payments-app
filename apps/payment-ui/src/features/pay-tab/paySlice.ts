import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export type PaymentMethod = 'qr-code' | 'connect-wallet'

interface PayState {
    paymentMethod: PaymentMethod
}

const initalState: PayState = {
    paymentMethod: 'qr-code',
}

const paySlice = createSlice({
    name: 'pay',
    initialState: initalState,
    reducers: {
        setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.paymentMethod = action.payload
        },
    },
    extraReducers(builder) {},
})

export const { setPaymentMethod } = paySlice.actions

export default paySlice.reducer

export const getPaymentMethod = (state: any): PaymentMethod =>
    state.pay.paymentMethod
