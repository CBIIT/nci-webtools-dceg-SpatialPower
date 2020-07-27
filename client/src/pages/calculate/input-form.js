import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { actions as paramsActions, getInitialState as getInitialParams } from '../../services/store/params';
const { merge: _mergeParams, reset: _resetParams } = paramsActions;

export function InputForm({
    className = '',
    onSubmit = e => { },
    onReset = e => { }
}) {
    const dispatch = useDispatch();
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(_mergeParams(value));
    const resetParams = _ => dispatch(_resetParams());

    function handleChange(event) {
        const target = event.target;
        const name = target.name;
        let value = '';

        switch (target.type) {
            case 'checkbox':
                value = Boolean(target.checked);
                break;
            case 'number':
                value = Number(target.value);
                break;
            default:
                value = target.value;
        }

        mergeParams({
            [name]: value
        });
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
            onReset(getInitialParams());
        }
    }

    return <form className={className}>
        <div className="form-group">
            <label htmlFor="simTotal" className="font-weight-semibold">simTotal</label>
            <input type="number" id="simTotal" name="simTotal" className="form-control" value={params.simTotal} onChange={handleChange} />
        </div>

        <div className="form-group">
            <label htmlFor="xCases" className="font-weight-semibold">xCases</label>
            <input type="number" id="xCases" name="xCases" className="form-control" value={params.xCases} onChange={handleChange} />
        </div>

        <div className="form-group">
            <label htmlFor="yCases" className="font-weight-semibold">yCases</label>
            <input type="number" id="yCases" name="yCases" className="form-control" value={params.yCases} onChange={handleChange} />
        </div>

        <div className="form-group">
            <label htmlFor="nCase" className="font-weight-semibold">nCase</label>
            <input type="number" id="nCase" name="nCase" className="form-control" value={params.nCase} onChange={handleChange} />
        </div>

        <div className="form-group">
            <label htmlFor="nControl" className="font-weight-semibold">nControl</label>
            <input type="number" id="nControl" name="nControl" className="form-control" value={params.nControl} onChange={handleChange} />
        </div>

        <div className="d-flex">
            cascon
            <div className="form-group custom-control">
                <input type="radio" id="casconTrue" name="cascon" value={true} onChange={handleChange} />
                <label htmlFor="cascon">True</label>
            </div>

            <div className="form-group custom-control">
                <input type="radio" id="casconFalse" name="cascon" value={false} onChange={handleChange} />
                <label htmlFor="cascon">False</label>
            </div>
        </div>


        <div className="form-group custom-control custom-checkbox">
            <input type="checkbox" className="custom-control-input" id="submit-queue" name="queue" checked={params.queue} onChange={handleChange} />
            <label className="custom-control-label" htmlFor="submit-queue">Submit this job to a queue</label>
        </div>



        <div className="form-group">
            <label
                htmlFor="email"
                className="font-weight-semibold">
                Email address
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
        </div>

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