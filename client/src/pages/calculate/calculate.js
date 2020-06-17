import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { InputForm } from './input-form';
import { Results } from './results';
import { postJSON } from '../../services/query';

export function Calculate() {
    const [results, setResults] = useState({});
    const [errors, setErrors] = useState([]);

    async function handleSubmit(params) {
        setResults({});
        setErrors([]);

        try {
            console.log(params);
            const url = params.queue ? 'submit-queue' : 'submit';
            setResults(await postJSON(url, params));
        } catch (error) {
            setErrors([error]);
        }
    }

    function removeError(index) {
        setErrors(errors.filter((e, i) => i !== index))
    }    

    return <div className="container my-4">
        <h1 className="h4 mb-4">Spatial Risk Calculation</h1>
        <div className="row">
            <div className="col-md-4">
                <div className="card shadow-sm h-100">
                    <InputForm className="card-body" onSubmit={handleSubmit}/>
                </div>
            </div>
            <div className="col-md-8">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                        {errors.map((error, i) => <Alert variant="danger" dismissible onClose={e => removeError(i)}>{error}</Alert>)}
                        <Results results={results} />
                    </div>
                </div>
            </div>
        </div>
    </div>

}