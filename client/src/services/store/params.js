import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    win: '',
    x_origin: 0,
    y_origin: 0,
    width: 1,
    height: 2,
    radius: 1,
    sim_total: 2,
    x_case: '',
    y_case: '',
    samp_case: '',
    samp_control: '',
    rand_seed: 1234,
    x_control: '',
    y_control: '',
    n_case: '100',
    n_control: '200',
    r_case: '',
    r_control: '',
    s_case: '',
    s_control: '',
    lower_tail: 0.025,
    upper_tail: 0.975,
    cascon: false,
    p_thresh: 0.8,
    plot_pts: true,
    title: false,
    suff_color: 'green',
    insuff_color: 'blue',
    case_color: 'purple',
    control_color: 'orange',
    case_symbol: 0,
    control_symbol: 1,
    case_size: 1,
    control_size: 1,
    plot_format: 'png',
    plot_width: 480,
    plot_height: 480,
    queue: false,
    email: '',
    job_name: 'Spatial-Power',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        mergeParams: mergeObject,
        resetParams: getInitialState,
    }
});