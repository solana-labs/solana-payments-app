import { RootState } from '@/store';
import { createSlice } from '@reduxjs/toolkit';

export interface GeoState {
    blocked: boolean;
}

const initalState: GeoState = {
    blocked: false,
};

const geoSlice = createSlice({
    name: 'geo',
    initialState: initalState,
    reducers: {
        setGeoIsBlocked: state => {
            state.blocked = true;
        },
    },
});

export const { setGeoIsBlocked } = geoSlice.actions;

export default geoSlice.reducer;

export const getIsBlocked = (state: RootState): boolean => state.geo.blocked;
