import React, { useState } from 'react';
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
    const [sims, setSims] = useState(2)

    const handleSims = (event) => setSims(event.target.value)

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
        if (name === 'win' && newParams.win == 'unit_circle' || newParams.win == 'unit_square') {

            newParams.x_case = 0.5
            newParams.y_case = 0.5
            newParams.s_case = 0.33
            newParams.r_case = 0.5


            newParams.x_control = 0.5
            newParams.y_control = 0.5
            newParams.s_control = 0.33
            newParams.r_control = 0.5
        }

        else if (newParams.win === 'rectangle' && name === 'win' || name === 'x_origin' || name === 'y_origin' || name === 'width' || name === 'height') {

            if (name === 'win') {
                newParams.x_origin = 0
                newParams.y_origin = 0
                newParams.width = 1
                newParams.height = 2
            }

            newParams.x_case = newParams.width / 2
            newParams.y_case = newParams.height / 2
            newParams.r_case = Math.floor(Math.min(newParams.width / 2, newParams.height / 2) * 10) / 10
            newParams.s_case = Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10

            newParams.x_control = newParams.width / 2
            newParams.y_control = newParams.height / 2
            newParams.r_control = Math.floor(Math.min(newParams.width / 2, newParams.height / 2) * 10) / 10
            newParams.s_control = Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10
        }

        else if (newParams.win === "circle" && name === 'win' || name === 'x_origin' || name === 'y_origin' || name === 'radius') {

            if (name === 'win') {
                newParams.x_origin = 1
                newParams.y_origin = 1
                newParams.radius = 1
            }

            newParams.x_case = newParams.x_origin;
            newParams.y_case = newParams.y_origin;
            newParams.r_case = Math.floor((newParams.radius / 2) * 10) / 10
            newParams.s_case = Math.floor((newParams.radius / 3) * 10) / 10

            newParams.x_control = newParams.x_origin;
            newParams.y_control = newParams.y_origin;
            newParams.r_control = Math.floor((newParams.radius / 2) * 10) / 10
            newParams.s_control = Math.floor((newParams.radius / 3) * 10) / 10
        }

        mergeParams(newParams);
    }

    function handleBlur(event) {
        const { name, value, dataset } = event.target;
        const newParams = { ...params, [name]: value };

        if (dataset.type === 'number-array')
            newParams[name] = value.split(/[\s,]+/g).map(Number).filter(n => !isNaN(n));

        mergeParams(newParams);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            const newParams = { ...params, ['sim_total']: sims }
            mergeParams(newParams)
            onSubmit(newParams);
        }
    }

    function handleReset(event) {
        event.preventDefault();
        window.scrollTo(0, 0);
        resetParams();
        if (onReset) {
            onReset(getInitialState());
        }
    }

    return <form className={className} onSubmit={handleSubmit} onReset={handleReset}>
        <fieldset className="border px-3 mb-4">
            <legend className="legend" style={{ width: '32%' }}>Spatial Window</legend>
            <div className="form-group">
                <label htmlFor="win" className="font-weight-bold required">Window Shape</label>
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
        </fieldset>

        <fieldset className="border px-3 mb-4">
            <legend className="legend" style={{ width: '28%' }}>Sample Case</legend>
            <div className="form-group">
                <label htmlFor="samp_case" className="font-weight-bold required">Case Type</label>
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

            {params.samp_case && <div className="form-group">
                <label htmlFor="x_case" className="font-weight-bold required">X coordinate(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="x_case_tooltip">Specify x-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="x_case"
                        name="x_case"
                        className="form-control"
                        value={params.x_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case && <div className="form-group">
                <label htmlFor="y_case" className="font-weight-bold required">Y coordinate(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="y_case_tooltip">Specify y-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="y_case"
                        name="y_case"
                        className="form-control"
                        value={params.y_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case && params.samp_case !== 'MVN' && <div className="form-group">
                <label htmlFor="r_case" className="font-weight-bold required">Radius (radii) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="r_case_tooltip">Optional. Specify the radius (radii) of case cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="r_case"
                        name="r_case"
                        className="form-control"
                        value={params.r_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case === 'MVN' && <div className="form-group">
                <label htmlFor="s_case" className="font-weight-bold required">Standard deviation(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="s_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for case locations in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="s_case"
                        name="s_case"
                        className="form-control"
                        value={params.s_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <fieldset className="border px-3 mb-4">
            <legend className="legend" style={{ width: '33%' }}>Sample Control</legend>
            <div className="form-group">
                <label htmlFor="samp_control" className="font-weight-bold required">Control Type</label>
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

            {params.samp_control && params.samp_control !== 'systematic' && <div className="form-group">
                <label htmlFor="x_control" className="font-weight-bold required">X coordinate(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="x_control_tooltip">Specify x-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="x_control"
                        name="x_control"
                        className="form-control"
                        value={params.x_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_control && params.samp_control !== 'systematic' && <div className="form-group">
                <label htmlFor="y_control" className="font-weight-bold required">Y coordinate(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="y_control_tooltip">Specify y-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="y_control"
                        name="y_control"
                        className="form-control"
                        value={params.y_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_control && params.samp_control === 'CSR' && <div className="form-group">
                <label htmlFor="r_control" className="font-weight-bold required">Radius (radii) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="r_control_tooltip">Optional. Specify the radius (radii) of control cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="r_control"
                        name="r_control"
                        className="form-control"
                        value={params.r_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_control === 'MVN' && <div className="form-group">
                <label htmlFor="s_control" className="font-weight-bold required">Standard deviation(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="s_control_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for control locations in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="s_control"
                        name="s_control"
                        className="form-control"
                        value={params.s_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <div className="form-group">
            <label htmlFor="sim_total" className="font-weight-bold required">Number of Simulations</label>
            <OverlayTrigger overlay={<Tooltip id="sim_total_tooltip">Specify the number of simulation iterations to perform.</Tooltip>}>
                <input
                    type="number"
                    id="sim_total"
                    name="sim_total"
                    className="form-control"
                    value={sims}
                    onChange={handleSims} />
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
                    value={params.rand_seed}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="n_case" className="font-weight-bold required">N Case</label>
            <OverlayTrigger overlay={<Tooltip id="n_case_tooltip">Specify the sample size for case locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="text"
                    data-type="number-array"
                    id="n_case"
                    name="n_case"
                    className="form-control"
                    value={params.n_case || ''}
                    onChange={handleChange}
                    onBlur={handleBlur} />
            </OverlayTrigger>
        </div>


        <div className="form-group">
            <label htmlFor="n_control" className="font-weight-bold required">N Control</label>
            <OverlayTrigger overlay={<Tooltip id="n_control_tooltip">Specify the sample size for control locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="text"
                    data-type="number-array"
                    id="n_control"
                    name="n_control"
                    className="form-control"
                    value={params.n_control || ''}
                    onChange={handleChange}
                    onBlur={handleBlur} />
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

        <hr className="mt-4" />

        <fieldset className="border px-3 mb-4">
            <legend className="legend" style={{ width: '15%' }}>Queue</legend>
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

            {params.queue && <div className="form-group">
                <label
                    htmlFor="job_name"
                    className="font-weight-bold required">
                    Job Name
            </label>
                <OverlayTrigger overlay={<Tooltip id="job_name_tooltip">Enter a name for the job.</Tooltip>}>
                    <input
                        type="text"
                        id="job_name"
                        name="job_name"
                        className="form-control"
                        value={params.job_name}
                        disabled={!params.queue}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>}

            {params.queue && <div className="form-group">
                <label
                    htmlFor="email"
                    className="font-weight-bold required">
                    Email
            </label>
                <OverlayTrigger overlay={<Tooltip id="email_tooltip">Results will be sent to the specified email.</Tooltip>}>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={params.email}
                        disabled={!params.queue}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <div className="text-right">
            <button type="reset" className="btn btn-outline-danger mx-1">
                Reset
            </button>

            <button type="submit" className="btn btn-primary">
                Submit
            </button>
        </div>
    </form>
}