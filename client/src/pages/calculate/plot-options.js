import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { actions } from '../../services/store/params';

export function PlotOptions({ onSubmit = e => { } }) {

    const dispatch = useDispatch();
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(actions.mergeParams(value));

    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(params);
        }
    }

    function handleChange(event) {

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

        const newParams = { ...params, [name]: value };
        mergeParams(newParams);
    }

    return (
        <>
            <div className="form-group">
                <label htmlFor="p_thresh" className="font-weight-bold">Power Threshold</label>
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
            <div className="text-right">
                <button
                    type="submit"
                    className="btn btn-primary"
                    onClick={handleSubmit}>
                    Submit
            </button>
            </div>
        </>
    )
}