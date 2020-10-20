import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    win: '',
    gis: false,
    geojson: '',
    x_origin: 0,
    y_origin: 0,
    latitude: 38.8766,
    longitude: -77.0028,
    unit: '',
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
    n_case: [100],
    n_control: [200],
    r_case: '',
    s_case: '',
    s_control: '',
    alpha: 0.05,
    upper_tail: 0.975,
    cascon: false,
    p_thresh: 0.8,
    plot_pts: true,
    title: false,
    axes: false,
    horizontal: false,
    suff_color: 'green',
    insuff_color: 'blue',
    case_color: 'purple',
    control_color: 'orange',
    case_symbol: 0,
    control_symbol: 1,
    case_size: 1,
    control_size: 1,
    plot_format: 'png',
    plot_width: 2000,
    plot_height: 2000,
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