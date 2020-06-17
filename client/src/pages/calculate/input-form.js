import React, { useState } from 'react';


export function InputForm({ className = '', onSubmit }) {
    const [params, setParams] = useState({
        simTotal: '',
        xCases: '',
        yCases: '',
        nCase: '',
        nControl: '',
        queue: true,
        email: '',
    });

    function handleChange(event) {
        const target = event.target;
        const name = target.name;
        let value = target.value;

        switch(target.type) {
            case 'checkbox':
                value = Boolean(target.checked);
                break;
            case 'number':
                value = Number(target.value);
                break;
            default:
                value = target.value;
        }

        setParams({ ...params, [name]: value });
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(params);
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

            <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}>
                Submit
        </button>
    </form>
}