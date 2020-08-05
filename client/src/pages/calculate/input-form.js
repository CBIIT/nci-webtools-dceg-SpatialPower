import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { actions, getInitialState } from '../../services/store/params';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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
        if (value === 'uniform') {
            if (name === 'samp_case') {
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.r_case = 1
            }
            else if (name === 'samp_control') {
                newParams.x_control = 0.5
                newParams.y_control = 0.5
                newParams.r_control = 1
            }
        }

        else if (value === 'MVN') {
            if (name === 'samp_case') {
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.s_case = 0.33
            }
            else if (name === 'samp_control') {
                newParams.x_control = 0.5
                newParams.y_control = 0.5
                newParams.s_control = 0.33
            }
        }

        else if (value === 'CSR') {
            if (name === 'samp_case') {
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.r_case = 1
            }
            else if (name === 'samp_control') {
                newParams.x_control = 0.5
                newParams.y_control = 0.5
                newParams.r_control = 1
            }
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
            <label htmlFor="sim_total" className="font-weight-semibold">sim_total</label>
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
            <label htmlFor="samp_case" className="font-weight-semibold">samp_case</label>
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
                    <option value="IPP">Inhomogeneous Poisson Process (IPP)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="samp_control" className="font-weight-semibold">samp_control</label>
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
                    <option value="IPP">Inhomogeneous Poisson Process (IPP)</option>
                    <option value="clustered">Neyman-Scott Cluster Process (clustered)</option>
                </select>
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="x_case" className="font-weight-semibold">x_case</label>
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
            <label htmlFor="y_case" className="font-weight-semibold">y_case</label>
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

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="x_control" className="font-weight-semibold">x_control</label>
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

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="y_control" className="font-weight-semibold">y_control</label>
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

        <div className="form-group">
            <label htmlFor="n_case" className="font-weight-semibold">n_case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify the sample size for case locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="n_case"
                    name="n_case"
                    className="form-control"
                    value={params.n_case ? params.n_case : ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>


        <div className="form-group">
            <label htmlFor="n_control" className="font-weight-semibold">n_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify the sample size for control locations in each cluster as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="n_control"
                    name="n_control"
                    className="form-control"
                    value={params.n_control ? params.n_control : ''}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="npc_control" className="font-weight-semibold">npc_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the number of clusters of control locations.</Tooltip>}>
                <input
                    type="number"
                    id="npc_control"
                    name="npc_control"
                    className="form-control"
                    value={params.npc_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_case !== 'MVN' && <div className="form-group">
            <label htmlFor="r_case" className="font-weight-semibold">r_case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the radius (radii) of case cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="r_case"
                    name="r_case"
                    className="form-control"
                    value={params.r_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="r_control" className="font-weight-semibold">r_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the radius (radii) of control cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="r_control"
                    name="r_control"
                    className="form-control"
                    value={params.r_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_case === 'MVN' && <div className="form-group">
            <label htmlFor="s_case" className="font-weight-semibold">s_case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for case locations in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="s_case"
                    name="s_case"
                    className="form-control"
                    value={params.s_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="s_control" className="font-weight-semibold">s_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for control locations in the units of win as a numeric value or vector.</Tooltip>}>
                <input
                    type="number"
                    id="s_control"
                    name="s_control"
                    className="form-control"
                    value={params.s_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'IPP' && <div className="form-group">
            <label htmlFor="l_case" className="font-weight-semibold">l_case</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify a single positive number, a vector of positive numbers, a function(x,y,...), or a pixel image for the intensity of the Poisson process for case clusters. </Tooltip>}>
                <input
                    type="number"
                    id="l_case"
                    name="l_case"
                    className="form-control"
                    value={params.l_case}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {!['uniform', 'systematic', 'MVN', 'CSR'].includes(params.samp_control) && <div className="form-group">
            <label htmlFor="l_control" className="font-weight-semibold">l_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify a single positive number, a vector of positive numbers, a function(x,y,...), or a pixel image for the intensity of the Poisson process for control clusters.</Tooltip>}>
                <input
                    type="number"
                    id="l_control"
                    name="l_control"
                    className="form-control"
                    value={params.l_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="e_control" className="font-weight-semibold">e_control</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Optional. Specify a single non-negative number for the size of the expansion of the simulation window for generating parent points.</Tooltip>}>
                <input
                    type="number"
                    id="e_control"
                    name="e_control"
                    className="form-control"
                    value={params.e_control}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>}

        <div className="form-group">
            <label htmlFor="lower_tail" className="font-weight-semibold">lower_tail</label>
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
                <label className="custom-control-label" htmlFor="cascon">cascon</label>
            </OverlayTrigger>

        </div>

        {params.cascon && <div className="form-group">
            <label htmlFor="upper_tail" className="font-weight-semibold">upper_tail</label>
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

        <div className="form-group">
            <label htmlFor="p_thresh" className="font-weight-semibold">p_thresh</label>
            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">Specify a numeric value between 0 and 1 (default = 0.8) for the power threshold.</Tooltip>}>
                <input
                    type="number"
                    step="any"
                    id="p_thresh"
                    name="p_thresh"
                    className="form-control"
                    value={params.p_thresh}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id="plot_pts"
                name="plot_pts"
                checked={params.plot_pts}
                onChange={handleChange} />

            <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="samp_case_tooltip">If checked, the points from the first simulation iteration will be added to second plot.</Tooltip>}>
                <label className="custom-control-label" htmlFor="plot_pts">plot_pts</label>
            </OverlayTrigger>
        </div>

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
                <label className="custom-control-label" htmlFor="queue">queue</label>
            </OverlayTrigger>
        </div>

        {params.queue && <div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-semibold">
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

        <pre>{JSON.stringify(params, null, 2)}</pre>
    </form>
}