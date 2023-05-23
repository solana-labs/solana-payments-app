import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const viewportSlice = createSlice({
    name: 'viewport',
    initialState: {
        isMobile: false, // 640 is the breakpoint for sm in tailwind by default
    },
    reducers: {
        setIsMobile: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
    },
});

export const { setIsMobile } = viewportSlice.actions;

export default viewportSlice.reducer;
