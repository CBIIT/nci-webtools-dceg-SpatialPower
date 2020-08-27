import { createSlice } from '@reduxjs/toolkit';
import { mergeArray, pushArray } from './utils';

export const getInitialState = () => [];

export const { actions, reducer } = createSlice({
    name: 'messages',
    initialState: getInitialState(),
    reducers: {
        addMessage: pushArray,
        mergeMessages: mergeArray,
        resetMessages: getInitialState,
        removeMessageByIndex(state, action) {
            const removeIndex = action.payload;
            return state.filter((_, index) => index !== removeIndex);
        }
    }
});