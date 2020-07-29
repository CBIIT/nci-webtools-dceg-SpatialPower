import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({loading: false});

export const { actions, reducer } = createSlice({
    name: 'results',
    initialState: getInitialState(),
    reducers: {
        mergeResults: mergeObject,
        resetResults: getInitialState,
    }
});