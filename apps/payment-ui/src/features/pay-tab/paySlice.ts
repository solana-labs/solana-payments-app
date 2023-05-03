import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import { RootState } from '../../store'

export type PaymentMethod = 'qr-code' | 'connect-wallet'

interface PayState {
    paymentMethod: PaymentMethod
    paymentId: string | null
    paymentDetails: PaymentDetails | null
    payingToken: PayingToken
}

interface PaymentDetails {
    merchantDisplayName: string
    totalAmountUSD: number
}

export enum PayingToken {
    USDC = 'USDC',
    USDT = 'USDT',
    SOL = 'SOL',
}

const initalState: PayState = {
    paymentMethod: 'connect-wallet',
    paymentId: null,
    paymentDetails: {
        merchantDisplayName: 'Starbucks',
        totalAmountUSD: 2500,
    },
    payingToken: PayingToken.USDC,
}

export const fetchPaymentDetails = createAsyncThunk<void, void>(
    'pay/fetchPaymentDetails',
    async () => {}
)

export const fetchPayingTokenConversion = createAsyncThunk<void, void>(
    'pay/fetchPayingTokenConversion',
    async () => {}
)

export const timerTick = createAsyncThunk<void, void>(
    'pay/timerTick',
    async (_, { getState }) => {
        // Access the current state
        const state = getState() as RootState
        const paymentId = state.pay.paymentId

        if (paymentId != null) {
            const response = await axios.get(
                `https://uj1ctqe20k.execute-api.us-east-1.amazonaws.com/payment-status?id=${paymentId}`
            )

            console.log(response.data)
        } else {
            console.log('TICKY TOCKY')
        }
    }
)

export const fetchTransaction = createAsyncThunk<void, void>(
    'pay/fetchTransaction',
    async () => {}
)

const paySlice = createSlice({
    name: 'pay',
    initialState: initalState,
    reducers: {
        setPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.paymentMethod = action.payload
        },
        setPayingToken: (state, action: PayloadAction<PayingToken>) => {
            state.payingToken = action.payload
        },
        setPaymentId: (state, action: PayloadAction<string>) => {
            state.paymentId = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPaymentDetails.pending, (state: PayState) => {
                // state.paymentMethod = 'connect-wallet'
            })
            .addCase(fetchPaymentDetails.rejected, (state: PayState) => {
                // state.paymentMethod = 'connect-wallet'
            })
            .addCase(fetchPaymentDetails.fulfilled, (state: PayState) => {
                // state.paymentMethod = 'connect-wallet'
            })
            .addCase(timerTick.pending, (state: PayState) => {
                // Handle timerTick.pending if needed
            })
            .addCase(timerTick.rejected, (state: PayState) => {
                // Handle timerTick.rejected if needed
            })
            .addCase(timerTick.fulfilled, (state: PayState) => {
                // Handle timerTick.fulfilled if needed
            })
    },
})

export const { setPaymentMethod, setPayingToken, setPaymentId } =
    paySlice.actions

export default paySlice.reducer

export const getPaymentMethod = (state: any): PaymentMethod =>
    state.pay.paymentMethod

export const getPayingToken = (state: any): PayingToken => state.pay.payingToken

export const getPaymentDetails = (state: any): PaymentDetails =>
    state.pay.paymentDetails ?? {
        merchantDisplayName: 'DEFAULT NAME',
        totalAmountUSD: 0,
    }
