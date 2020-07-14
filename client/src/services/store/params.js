import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    simTotal: '',
    xCases: '',
    yCases: '',
    nCase: '',
    nControl: '',
    queue: true,
    email: '',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        merge: mergeObject,
        reset: getInitialState,
    }
});