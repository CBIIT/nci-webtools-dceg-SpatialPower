import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    simTotal: '',
    xCases: '',
    yCases: '',
    samp_case: 'uniform',
    samp_control: 'uniform',
    nCase: '',
    nControl: '',
    queue: true,
    email: '',
    cascon: 'false',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        merge: mergeObject,
        reset: getInitialState,
    }
});