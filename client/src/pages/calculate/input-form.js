import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getInputEventValue } from './utils';
import { actions, getInitialState } from '../../services/store/params';

export function InputForm({
    className = '',
    onSubmit = e => { },
    onReset = e => { }
}) {
    const dispatch = useDispatch();
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const resetParams = _ => dispatch(actions.resetParams());
    const simQueueCutoff = 100;

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        const newParams = { ...params, [name]: value };

        // cap maximum number of simulations
        newParams.sim_total = Math.min(50000, newParams.sim_total);

        // force queueing when running over 100 simulations
        if (newParams.sim_total > simQueueCutoff) {
            newParams.queue = true;
        }

        // set default parameters
        if (name === 'samp_case') {
            newParams.x_case = 0.5
            newParams.y_case = 0.5

            if (value === 'MVN')
                newParams.s_case = 0.33
            else
                newParams.r_case = 0.5
        }

        if (name === 'samp_control' && value !== 'systematic') {
            newParams.x_control = 0.5
            newParams.y_control = 0.5

            if (value === 'MVN')
                newParams.s_control = 0.33

            if (value === 'CSR')
                newParams.r_control = 0.5
        }

        mergeParams(newParams);
    }


    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(params);
        }
    }

    function handleReset(event) {
        event.preventDefault();
        resetParams();
        if (onReset) {
            onReset(getInitialState());
        }
    }

    return <form className={className}>
        <div className="form-group">
            <label htmlFor="win" className="font-weight-bold required">Spatial Window</label>
            <OverlayTrigger overlay={<Tooltip id="win_tooltip">Specify the shape of the window</Tooltip>}>
                <select
                    id="win"
                    name="win"
                    className="custom-select"
                    value={params.win}
                    onChange={handleChange}>
                    <option value="" hidden>(select option)</option>
                    <option value="unit_circle">Unit Circle</option>
                    <option value="unit_square">Unit Square</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="circle">Circle</option>
                </select>
            </OverlayTrigger>
        </div>

        {params.win === "rectangle" && <>
            <div className="row">
                <div className="col-md-6 form-group">
                    <label htmlFor="x_origin" className="font-weight-bold required">X Origin</label>
                    <OverlayTrigger overlay={<Tooltip id="x_origin_tooltip">Enter the X coordinate of the lower left corner</Tooltip>}>
                        <input
                            type="number"
                            id="x_origin"
                            name="x_origin"
                            step="any"
                            className="form-control"
                            value={params.x_origin}
                            onChange={handleChange} />
                    </OverlayTrigger>
                </div>

                <div className="col-md-6 form-group">
                    <label htmlFor="y_origin" className="font-weight-bold required">Y Origin</label>
                    <OverlayTrigger overlay={<Tooltip id="y_origin_tooltip">Enter the Y coordinate of the lower left corner</Tooltip>}>
                        <input
                            type="number"
                            id="y_origin"
                            name="y_origin"
                            step="any"
                            className="form-control"
                            value={params.y_origin}
                            onChange={handleChange} />
                    </OverlayTrigger>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 form-group">
                    <label htmlFor="width" className="font-weight-bold required">Width</label>
                    <OverlayTrigger overlay={<Tooltip id="width_tooltip">Enter the width of the rectangle</Tooltip>}>
                        <input
                            type="number"
                            id="width"
                            name="width"
                            step="any"
                            min="0"
                            className="form-control"
                            value={params.width || ''}
                            onChange={handleChange} />
                    </OverlayTrigger>
                </div>

                <div className="col-md-6 form-group">
                    <label htmlFor="height" className="font-weight-bold required">Height</label>
                    <OverlayTrigger overlay={<Tooltip id="height_tooltip">Enter the height of the rectangle</Tooltip>}>
                        <input
                            type="number"
                            id="height"
                            name="height"
                            step="any"
                            min="0"
                            className="form-control"
                            value={params.height || ''}
                            onChange={handleChange} />
                    </OverlayTrigger>
                </div>
            </div>
        </>}

        {params.win === "circle" && <div className="row">
            <div className="col-md-4 form-group">
                <label htmlFor="x_origin" className="font-weight-bold required">X Origin</label>
                <OverlayTrigger overlay={<Tooltip id="x_origin_tooltip">Enter the X coordinate of the center of the circle</Tooltip>}>
                    <input
                        type="number"
                        id="x_origin"
                        name="x_origin"
                        step="any"
                        className="form-control"
                        value={params.x_origin}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>

            <div className="col-md-4 form-group">
                <label htmlFor="y_origin" className="font-weight-bold required">Y Origin</label>
                <OverlayTrigger overlay={<Tooltip id="y_origin_tooltip">Enter the Y coordinate of the center of the circle</Tooltip>}>
                    <input
                        type="number"
                        id="y_origin"
                        name="y_origin"
                        step="any"
                        className="form-control"
                        value={params.y_origin}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>

            <div className="col-md-4 form-group">
                <label htmlFor="radius" className="font-weight-bold required">Radius</label>
                <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Enter the radius of the circle</Tooltip>}>
                    <input
                        type="number"
                        id="radius"
                        name="radius"
                        step="any"
                        min="0"
                        className="form-control"
                        value={params.radius || ''}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>
        </div>}

        <div className="form-group">
            <label htmlFor="samp_case" className="font-weight-bold required">Sample Case</label>
            <OverlayTrigger overlay={<Tooltip id="samp_case_tooltip">Specify how case locations are randomized.</Tooltip>}>
                <select
                    id="samp_case"
                    name="samp_case"
                    className="custom-select"
                    value={params.samp_case}
                    onChange={handleChange}>
                    <option value="" hidden>(select option)</option>
                    <option value="uniform">Uniform</option>
                    <option value="MVN">Multivariate Normal (MVN)</option>
                    <option value="CSR">Complete Spatial Randomness (CSR)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="samp_control" className="font-weight-bold required">Sample Control</label>
            <OverlayTrigger overlay={<Tooltip id="samp_control_tooltip">Specify how control locations are randomized.</Tooltip>}>
                <select
                    id="samp_control"
                    name="samp_control"
                    className="custom-select"
                    value={params.samp_control}
                    onChange={handleChange}>
                    <option value="" hidden>(select option)</option>
                    <option value="uniform">Uniform</option>
                    <option value="systematic">Systematic</option>
                    <option value="MVN">Multivariate Normal (MVN)</option>
                    <option value="CSR">Complete Spatial Randomness (CSR)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="sim_total" className="font-weight-bold required">Number of Simulations</label>
            <OverlayTrigger overlay={<Tooltip id="sim_total_tooltip">Specify the number of simulation iterations to perform.</Tooltip>}>
                <input
                    type="number"
                    id="sim_total"
                    name="sim_total"
                    className="form-control"
                    value={params.sim_total || ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="rand_seed" className="font-weight-bold required">Random Seed</label>
            <OverlayTrigger overlay={<Tooltip id="rand_seed_tooltip">Specify a random seed</Tooltip>}>
                <input
                    type="number"
                    id="rand_seed"
                    name="rand_seed"
                    className="form-control"
                    value={params.rand_seed || ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <hr className="mt-4" />

        {params.samp_case !== '' && <div className="form-group">
            <label htmlFor="x_case" className="font-weight-bold required">X Case</label>
            <OverlayTrigger overlay={<Tooltip id="x_case_tooltip">Specify x-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="x_case"
                    name="x_case"
                    className="form-control"
                    value={params.x_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_case !== '' && <div className="form-group">
            <label htmlFor="y_case" className="font-weight-bold required">Y Case</label>
            <OverlayTrigger overlay={<Tooltip id="y_case_tooltip">Specify y-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="y_case"
                    name="y_case"
                    className="form-control"
                    value={params.y_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control !== 'systematic' && params.samp_control !== '' && <div className="form-group">
            <label htmlFor="x_control" className="font-weight-bold required">X Control</label>
            <OverlayTrigger overlay={<Tooltip id="x_control_tooltip">Specify x-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="x_control"
                    name="x_control"
                    className="form-control"
                    value={params.x_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control !== 'systematic' && params.samp_control !== '' && <div className="form-group">
            <label htmlFor="y_control" className="font-weight-bold required">Y Control</label>
            <OverlayTrigger overlay={<Tooltip id="y_control_tooltip">Specify y-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="y_control"
                    name="y_control"
                    className="form-control"
                    value={params.y_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_case !== 'MVN' && params.samp_case !== '' && <div className="form-group">
            <label htmlFor="r_case" className="font-weight-bold required">R Case</label>
            <OverlayTrigger overlay={<Tooltip id="r_case_tooltip">Optional. Specify the radius (radii) of case cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="r_case"
                    name="r_case"
                    className="form-control"
                    value={params.r_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'CSR' && params.samp_control !== '' && <div className="form-group">
            <label htmlFor="r_control" className="font-weight-bold required">R Control</label>
            <OverlayTrigger overlay={<Tooltip id="r_control_tooltip">Optional. Specify the radius (radii) of control cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="r_control"
                    name="r_control"
                    className="form-control"
                    value={params.r_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_case === 'MVN' && params.samp_case !== '' && <div className="form-group">
            <label htmlFor="s_case" className="font-weight-bold required">S Case</label>
            <OverlayTrigger overlay={<Tooltip id="s_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for case locations in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="s_case"
                    name="s_case"
                    className="form-control"
                    value={params.s_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'MVN' && params.samp_control !== '' && <div className="form-group">
            <label htmlFor="s_control" className="font-weight-bold required">S Control</label>
            <OverlayTrigger overlay={<Tooltip id="s_control_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for control locations in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="s_control"
                    name="s_control"
                    className="form-control"
                    value={params.s_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {(params.samp_case !== '' || params.samp_control !== '') && <hr className="mt-4" />}

        <div className="form-group">
            <label htmlFor="n_case" className="font-weight-bold required">N Case</label>
            <OverlayTrigger overlay={<Tooltip id="n_case_tooltip">Specify the sample size for case locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="n_case"
                    name="n_case"
                    className="form-control"
                    value={params.n_case || ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>


        <div className="form-group">
            <label htmlFor="n_control" className="font-weight-bold required">N Control</label>
            <OverlayTrigger overlay={<Tooltip id="n_control_tooltip">Specify the sample size for control locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="n_control"
                    name="n_control"
                    className="form-control"
                    value={params.n_control || ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="lower_tail" className="font-weight-bold required">Lower Tail</label>
            <OverlayTrigger overlay={<Tooltip id="lower_tail_tooltip">Optional. Specify a numeric value for the lower p-value threshold (default=0.025).</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="lower_tail"
                    name="lower_tail"
                    className="form-control"
                    value={params.lower_tail}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id="cascon"
                name="cascon"
                onChange={handleChange} />
            <OverlayTrigger overlay={<Tooltip id="cascon_tooltip">If checked, computes the statistical power to detect case clusters and control clusters. If not, computes the statistical power to detect case clusters only.</Tooltip>}>
                <label className="custom-control-label" htmlFor="cascon">Detect Control Clusters</label>
            </OverlayTrigger>

        </div>

        {params.cascon && <div className="form-group">
            <label htmlFor="upper_tail" className="font-weight-bold required">Upper Tail</label>
            <OverlayTrigger overlay={<Tooltip id="upper_tail_tooltip">Optional. Specify a numeric value for the upper p-value threshold (default=0.975).</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="upper_tail"
                    name="upper_tail"
                    className="form-control"
                    value={params.upper_tail}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        <hr className="mt-4" />

        <div className="form-group custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id="queue"
                name="queue"
                checked={params.queue}
                onChange={handleChange}
                readOnly={params.sim_total > simQueueCutoff} />

            <OverlayTrigger overlay={<Tooltip id="queue_tooltip">If checked, submit this job to a processing queue and receive results via email. This option will always be selected if more than {simQueueCutoff} simulations will be run.</Tooltip>}>
                <label className="custom-control-label" htmlFor="queue">Submit Job to Queue</label>
            </OverlayTrigger>
        </div>

        {<div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-bold">
                Email
            </label>
            <OverlayTrigger overlay={<Tooltip id="email_tooltip">Results will be sent to the specified email.</Tooltip>}>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    aria-describedby="email-help"
                    value={params.email}
                    disabled={!params.queue}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {<div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-bold">
                Job Name
            </label>
            <OverlayTrigger overlay={<Tooltip id="job_name_tooltip">Enter the name of the job</Tooltip>}>
                <input
                    type="job"
                    id="job_name"
                    name="job_name"
                    className="form-control"
                    aria-describedby="job_name-help"
                    value={params.job_name}
                    disabled={!params.queue}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        <div className="text-right">
            <button
                type="reset"
                className="btn btn-outline-danger mx-1"
                onClick={handleReset}>
                Reset
            </button>

            <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}>
                Submit
            </button>
        </div>
    </form>
}