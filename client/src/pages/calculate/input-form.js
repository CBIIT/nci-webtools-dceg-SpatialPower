import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
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

    function getInputEventValue(event) {
        const target = event.target;
        const name = target.name;
        const type = target.type || target.getAttribute('data-type');
        let value = '';

        switch (type) {
            case 'checkbox':
                value = Boolean(target.checked);
                break;
            case 'number':
                value = Number(target.value);
                break;
            case 'number-array':
                value = target.value.split(/[\s,]+/g).map(Number).filter(n => !isNaN(n));
                break;
            default:
                value = target.value;
        }

        return { name, value };
    }

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
            <label htmlFor="win" className="font-weight-bold">Window</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="win_tooltip">Specify the shape of the window</Tooltip>}>
                <select
                    id="win"
                    name="win"
                    className="custom-select"
                    value={params.win}
                    onChange={handleChange}>
                    <option selected value="" hidden>(select option)</option>
                    <option value="unit_circle">Unit Circle</option>
                    <option value="unit_square">Unit Square</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="samp_case" className="font-weight-bold">Sample Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify how case locations are randomized.</Tooltip>}>
                <select
                    id="samp_case"
                    name="samp_case"
                    className="custom-select"
                    value={params.samp_case}
                    onChange={handleChange}>
                    <option selected value="" hidden>(select option)</option>
                    <option value="uniform">Uniform</option>
                    <option value="MVN">Multivariate Normal (MVN)</option>
                    <option value="CSR">Complete Spatial Randomness (CSR)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="samp_control" className="font-weight-bold">Sample Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify how control locations are randomized.</Tooltip>}>
                <select
                    id="samp_control"
                    name="samp_control"
                    className="custom-select"
                    value={params.samp_control}
                    onChange={handleChange}>
                    <option selected value="" hidden>(select option)</option>
                    <option value="uniform">Uniform</option>
                    <option value="systematic">Systematic</option>
                    <option value="MVN">Multivariate Normal (MVN)</option>
                    <option value="CSR">Complete Spatial Randomness (CSR)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="sim_total" className="font-weight-bold">Number of Simulations</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="sim_total_tooltip">Specify the number of simulation iterations to perform.</Tooltip>}>
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
            <label htmlFor="rand_seed" className="font-weight-bold">Random Seed</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="sim_total_tooltip">Specify a random seed</Tooltip>}>
                <input
                    type="number"
                    id="rand_seed"
                    name="rand_seed"
                    className="form-control"
                    value={params.rand_seed || ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <hr class="mt-4" style={{ borderTop: '2px solid #c3c4c9' }} />

        <div className="form-group">
            <label htmlFor="x_case" className="font-weight-bold">X Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify x-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="x_case"
                    name="x_case"
                    className="form-control"
                    value={params.x_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="y_case" className="font-weight-bold">Y Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify y-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="y_case"
                    name="y_case"
                    className="form-control"
                    value={params.y_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        {params.samp_control !== 'systematic' && <div className="form-group">
            <label htmlFor="x_control" className="font-weight-bold">X Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify x-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
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

        {params.samp_control !== 'systematic' && <div className="form-group">
            <label htmlFor="y_control" className="font-weight-bold">Y Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify y-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
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

        {params.samp_case !== 'MVN' && <div className="form-group">
            <label htmlFor="r_case" className="font-weight-bold">R Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the radius (radii) of case cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
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

        {params.samp_control === 'CSR' && <div className="form-group">
            <label htmlFor="r_control" className="font-weight-bold">R Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the radius (radii) of control cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
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

        {params.samp_case === 'MVN' && <div className="form-group">
            <label htmlFor="s_case" className="font-weight-bold">S Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for case locations in the units of win as a numeric value or vector.</Tooltip>}>
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

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="s_control" className="font-weight-bold">S Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for control locations in the units of win as a numeric value or vector.</Tooltip>}>
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

        <hr class="mt-4" style={{ borderTop: '2px solid #c3c4c9' }} />

        <div className="form-group">
            <label htmlFor="n_case" className="font-weight-bold">N Case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify the sample size for case locations in each cluster as a numeric value or vector.</Tooltip>}>
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
            <label htmlFor="n_control" className="font-weight-bold">N Control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify the sample size for control locations in each cluster as a numeric value or vector.</Tooltip>}>
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
            <label htmlFor="lower_tail" className="font-weight-bold">Lower Tail</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify a numeric value for the lower p-value threshold (default=0.025).</Tooltip>}>
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
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">If checked, computes the statistical power to detect case clusters and control clusters. If not, computes the statistical power to detect case clusters only.</Tooltip>}>
                <label className="custom-control-label" htmlFor="cascon">Detect Control Cluster</label>
            </OverlayTrigger>

        </div>

        {params.cascon && <div className="form-group">
            <label htmlFor="upper_tail" className="font-weight-bold">Upper Tail</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify a numeric value for the upper p-value threshold (default=0.975).</Tooltip>}>
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

        <hr class="mt-4" style={{ borderTop: '2px solid #c3c4c9' }} />

        <div className="form-group custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id="queue"
                name="queue"
                checked={params.queue}
                onChange={handleChange}
                readOnly={params.sim_total > simQueueCutoff} />

            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">If checked, submit this job to a processing queue and receive results via email. This option will always be selected if more than {simQueueCutoff} simulations will be run.</Tooltip>}>
                <label className="custom-control-label" htmlFor="queue">Submit job to queue</label>
            </OverlayTrigger>
        </div>

        {<div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-bold">
                Email
            </label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Results will be sent to the specified email.</Tooltip>}>
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