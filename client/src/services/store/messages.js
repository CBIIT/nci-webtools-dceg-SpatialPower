import { createSlice } from '@reduxjs/toolkit';
import { mergeArray } from './utils';

export const getInitialState = () => [];

export const { actions, reducer } = createSlice({
    name: 'messages',
    initialState: getInitialState(),
    reducers: {
        mergeMessages: mergeArray,
        resetMessages: getInitialState,
        removeMessageByIndex(state, action) {
            const removeIndex = action.payload;
            return state.filter((item, index) => index !== removeIndex);
        }
    }
});