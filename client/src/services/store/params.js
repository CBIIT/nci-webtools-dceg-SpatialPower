import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    win: '',
    sim_total: 2,
    x_case: '',
    y_case: '',
    samp_case: '',
    samp_control: '',
    rand_seed: 1234,
    x_control: '',
    y_control: '',
    n_case: 100,
    n_control: 200,
    r_case: '',
    r_control: '',
    s_case: '',
    s_control: '',
    lower_tail: 0.025,
    upper_tail: 0.975,
    cascon: false,
    p_thresh: 0.8,
    plot_pts: true,
    queue: false,
    email: '',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        mergeParams: mergeObject,
        resetParams: getInitialState,
    }
});