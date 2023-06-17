import { RootState } from '@/store';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export interface EnvState {
    backendUrl: string | undefined;
    websocketUrl: string | undefined;
    error: boolean;
}

const initalState: EnvState = {
    backendUrl: undefined,
    websocketUrl: undefined,
    error: false,
};

const envSlice = createSlice({
    name: 'env',
    initialState: initalState,
    reducers: {
        setBackendUrlEnv: (state, action: PayloadAction<string | undefined>) => {
            if (action.payload == undefined) {
                state.error = true;
            } else {
                state.backendUrl = action.payload;
            }
        },
        setWebsocketUrlEnv: (state, action: PayloadAction<string | undefined>) => {
            if (action.payload == undefined) {
                state.error = true;
            } else {
                state.websocketUrl = action.payload;
            }
        },
    },
});

export const { setBackendUrlEnv, setWebsocketUrlEnv } = envSlice.actions;

export default envSlice.reducer;

export const getIsError = (state: RootState): boolean => state.geo.blocked;
export const getIsConfigured = (state: RootState): boolean =>
    state.env.backendUrl != undefined && state.env.websocketUrl != undefined;
export const getWebSocketUrl = (state: RootState): string | undefined => state.env.websocketUrl;
export const getBackendUrl = (state: RootState): string | undefined => state.env.backendUrl;
