import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

        return {name, value};
    }

    function handleChange(event) {
        const {name, value} = getInputEventValue(event);
        const newParams = {...params, [name]: value};

        // cap maximum number of simulations
        newParams.simTotal = Math.min(50000, newParams.simTotal);

        // force queueing when running over 100 simulations
        if (newParams.simTotal > simQueueCutoff) {
            newParams.queue = true;
        }

        mergeParams(newParams);
    }

    function handleSampChange(event){

        const {name, value} = getInputEventValue(event);
        const newParams = {...params, [name]: value};

        if(value === 'uniform'){
            if(name === 'samp_case'){
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.r_case = 1
            }
            else if(name === 'samp_control'){
                newParams.x_control = 0.5
                newParams.y_control = 0.5
                newParams.r_control = 1
            }
        }

        else if(value === 'MVN'){
            if(name === 'samp_case'){
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.r_case = 0.33
            }
            else if(name === 'samp_control'){
                newParams.x_control = 0.5
                newParams.y_control = 0.5
                newParams.r_control = 0.33
            }
        }
        else if(value === 'CSR'){
            if(name === 'samp_case'){
                newParams.x_case = 0.5
                newParams.y_case = 0.5
                newParams.r_case = 1
            }
            else if(name === 'samp_control'){
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
            <input type="number" id="sim_total" name="sim_total" className="form-control" value={params.sim_total ? params.sim_total : ''} onChange={handleChange} />
            <small className="form-text text-muted">
                Integer, specifying the number of simulation iterations to perform.
            </small>            
        </div>

        <div className="form-group">
            <label htmlFor="samp_case" className="font-weight-semibold">samp_case</label>
            <select id="samp_case" name="samp_case" className="custom-select" value={params.samp_case} onChange={handleSampChange}>
                <option selected value="" hidden>(select option)</option>
                <option value="uniform">Uniform</option>
                <option value="MVN">Multivariate Normal (MVN)</option>
                <option value="CSR">Complete Spatial Randomness (CSR)</option>
                <option value="IPP">Inhomogeneous Poisson Process (IPP)</option>
            </select>
            <small className="form-text text-muted">
                Character string specifying whether to randomize the case locations uniformly (samp_case="uniform"), multivariate normal (samp_case="MVN"), with complete spatial randomness (samp_case="CSR"), or using the inhomogeneous Poisson process (samp_case="IPP") around each case centroid.
            </small>
        </div>
     

        <div className="form-group">
            <label htmlFor="samp_control" className="font-weight-semibold">samp_control</label>
            <select id="samp_control" name="samp_control" className="custom-select" value={params.samp_control} onChange={handleSampChange}>
                <option selected value="" hidden>(select option)</option>
                <option value="uniform">Uniform</option>
                <option value="systematic">Systematic</option>
                <option value="MVN">Multivariate Normal (MVN)</option>
                <option value="CSR">Complete Spatial Randomness (CSR)</option>
                <option value="IPP">Inhomogeneous Poisson Process (IPP)</option>
                <option value="clustered">Neyman-Scott Cluster Process (clustered)</option>
            </select>
            <small className="form-text text-muted">
            Character string specifying whether to randomize the control locations uniformly (samp_control="uniform"), systematically (samp_control="systematic"), multivariate normal (samp_control="MVN"), with complete spatial randomness (samp_control="CSR"), using the inhomogeneous Poisson process (samp_control="IPP"), or a realisation of the Neyman-Scott cluster process (samp_control="clustered").
            </small>
        </div>

        <div className="form-group">
            <label htmlFor="x_case" className="font-weight-semibold">x_case</label>
            <input type="number" step="any" id="x_case" name="x_case" className="form-control" value={params.x_case} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of x-coordinate(s) of case cluster(s).
            </small>
        </div>

        <div className="form-group">
            <label htmlFor="y_case" className="font-weight-semibold">y_case</label>
            <input type="number" step="any" id="y_case" name="y_case" className="form-control" value={params.y_case} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of y-coordinate(s) of case cluster(s).
            </small>
        </div>

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="x_control" className="font-weight-semibold">x_control</label>
            <input type="number" step="any" id="x_control" name="x_control" className="form-control" value={params.x_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of x-coordinate(s) of case cluster(s). Ignored if samp_control!="MVN".            
            </small>
        </div>}

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="y_control" className="font-weight-semibold">y_control</label>
            <input type="number" step="any" id="y_control" name="y_control" className="form-control" value={params.y_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of y-coordinate(s) of case cluster(s). Ignored if samp_control!="MVN".
            </small>
        </div>}

        <div className="form-group">
            <label htmlFor="n_case" className="font-weight-semibold">n_case</label>
            <input type="number" id="n_case" name="n_case" className="form-control" value={params.n_case ? params.n_case : ''} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of the sample size for case locations in each cluster.
            </small>
        </div>


        <div className="form-group">
            <label htmlFor="n_control" className="font-weight-semibold">n_control</label>
            <input type="number" id="n_control" name="n_control" className="form-control" value={params.n_control ? params.n_control : ''} onChange={handleChange} />
            <small className="form-text text-muted">
                Numeric value, or numeric vector, of the sample size for control locations in each cluster.
            </small>
        </div>

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="npc_control" className="font-weight-semibold">npc_control</label>
            <input type="number" id="npc_control" name="npc_control" className="form-control" value={params.npc_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value of the number of clusters of control locations. Ignored if samp_control!="clustered".
            </small>
        </div>}

        {params.samp_control !== 'MVN' && <div className="form-group">
            <label htmlFor="r_case" className="font-weight-semibold">r_case</label>
            <input type="number" id="r_case" name="r_case" className="form-control" value={params.r_case} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value, or numeric vector, of radius (radii) of case cluster(s) in the units of win. Ignored if samp_case="MVN".
            </small>
        </div>}

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="r_control" className="font-weight-semibold">r_control</label>
            <input type="number" id="r_control" name="r_control" className="form-control" value={params.r_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value, or numeric vector, of radius (radii) of control cluster(s) in the units of win. Ignored if samp_control!="clustered".
            </small>
        </div>}

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="s_case" className="font-weight-semibold">s_case</label>
            <input type="number" id="s_case" name="s_case" className="form-control" value={params.s_case} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value, or numeric vector, for the standard deviation(s) of the multivariate normal distribution for case locations in the units of win. Ignored if samp_control!="MVN".
            </small>
        </div>}

        {params.samp_control === 'MVN' && <div className="form-group">
            <label htmlFor="s_control" className="font-weight-semibold">s_control</label>
            <input type="number" id="s_control" name="s_control" className="form-control" value={params.s_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value, or numeric vector, for the standard deviation(s) of the multivariate normal distribution for control locations in the units of win. Ignored if samp_control!="MVN".
            </small>
        </div>}

        {params.samp_control === 'IPP' && <div className="form-group">
            <label htmlFor="l_case" className="font-weight-semibold">l_case</label>
            <input type="number" id="l_case" name="l_case" className="form-control" value={params.l_case} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. A single positive number, a vector of positive numbers, a function(x,y,...), or a pixel image. Intensity of the Poisson process for case clusters. Ignored if samp_control!="IPP".
            </small>
        </div>}

        {!['uniform', 'systematic', 'MVN', 'CSR'].includes(params.samp_control) && <div className="form-group">
            <label htmlFor="l_control" className="font-weight-semibold">l_control</label>
            <input type="number" id="l_control" name="l_control" className="form-control" value={params.l_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. A single positive number, a vector of positive numbers, a function(x,y,...), or a pixel image. Intensity of the Poisson process for control clusters. Ignored if samp_control="uniform", samp_control="systematic", samp_control="MVN", or samp_control="CSR".
            </small>
        </div>}

        {params.samp_control === 'clustered' && <div className="form-group">
            <label htmlFor="e_control" className="font-weight-semibold">e_control</label>
            <input type="number" id="e_control" name="e_control" className="form-control" value={params.e_control} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. A single non-negative number for the size of the expansion of the simulation window for generating parent points. Ignored if samp_control!="clustered".
            </small>
        </div>}

        <div className="form-group">
            <label htmlFor="lower_tail" className="font-weight-semibold">lower_tail</label>
            <input type="number" step="any" id="lower_tail" name="lower_tail" className="form-control" value={params.lower_tail} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value of lower p-value threshold (default=0.025).
            </small>
        </div>

        <div className="form-group custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="cascon" name="cascon" onChange={handleChange} />
            <label className="custom-control-label" htmlFor="cascon">cascon</label>
            <small className="form-text text-muted">
                Logical. If TRUE, computes the statistical power to detect case clusters and control clusters. If FALSE (the default), computes the statistical power to detect case clusters only.
            </small>
        </div>

        {params.cascon && <div className="form-group">
            <label htmlFor="upper_tail" className="font-weight-semibold">upper_tail</label>
            <input type="number" step="any" id="upper_tail" name="upper_tail" className="form-control" value={params.upper_tail} onChange={handleChange} />
            <small className="form-text text-muted">
                Optional. Numeric value of upper p-value threshold (default=0.975). Ignored if cascon=FALSE.
            </small>
        </div>}

        <div className="form-group">
            <label htmlFor="p_thresh" className="font-weight-semibold">p_thresh</label>
            <input type="number" step="any" id="p_thresh" name="p_thresh" className="form-control" value={params.p_thresh} onChange={handleChange} />
            <small className="form-text text-muted">
                A numeric value between 0 and 1 (default = 0.8) for the power threshold
            </small>
        </div>

        <div className="form-group custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="plot_pts" name="plot_pts" checked={params.plot_pts} onChange={handleChange} />
            <label className="custom-control-label" htmlFor="plot_pts">plot_pts</label>
            <small className="form-text text-muted">
                Logical. If TRUE (the default), the points from the first simulation iteration willbe added to second plot. Not if FALSE.
            </small>
        </div>

        <div className="form-group custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="queue" name="queue" checked={params.queue} onChange={handleChange} readOnly={params.simTotal > simQueueCutoff} />
            <label className="custom-control-label" htmlFor="queue">submit job to queue</label>
            <small className="form-text text-muted">
                This option will always be selected if more than {simQueueCutoff} simulations will be run.
            </small>
        </div>

        {params.queue && <div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-semibold">
                Email
            </label>
            <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                aria-describedby="email-help"
                value={params.email}
                disabled={!params.queue}
                onChange={handleChange} />
            <small
                id="email-help"
                className="form-text text-muted">
                Results will be sent to the specified email.
            </small>
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