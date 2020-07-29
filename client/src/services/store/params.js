import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    win: 'unit.circle',
    sim_total: '',
    x_case: '',
    y_case: '',
    samp_case: '',
    samp_control: '',
    x_control: '',
    y_control: '',
    n_case: '',
    n_control: '',
    npc_control: '',
    r_case: '',
    r_control: '',
    s_case: '',
    s_control: '',
    l_case: '',
    l_control: '',
    e_control: '',
    lower_tail: 0.025,
    upper_tail: 0.975,
    cascon: false,
    queue: false,
    email: '',
    cascon: 'false',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        mergeParams: mergeObject,
        resetParams: getInitialState,
    }
});