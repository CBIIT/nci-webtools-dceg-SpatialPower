import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    win: 'unit.circle',
    sim_total: 2,
    x_case: '',
    y_case: '',
    samp_case: '',
    samp_control: '',
    x_control: '',
    y_control: '',
    n_case: 100,
    n_control: 200,
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
    p_thresh: 0.8,
    plot_pts: true,
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