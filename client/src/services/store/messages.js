import { createSlice } from '@reduxjs/toolkit';
import { mergeArray } from './utils';

export const getInitialState = () => [];

export const { actions, reducer } = createSlice({
    name: 'messages',
    initialState: getInitialState(),
    reducers: {
        merge: mergeArray,
        reset: getInitialState,
        removeByIndex(state, action) {
            const removeIndex = action.payload;
            return state.filter((item, index) => index !== removeIndex);
        }
    }
});