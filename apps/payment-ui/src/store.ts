import { configureStore, combineReducers } from '@reduxjs/toolkit'
import payReducer from './features/pay-tab/paySlice'

export const store = configureStore({
    reducer: {
        pay: payReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
