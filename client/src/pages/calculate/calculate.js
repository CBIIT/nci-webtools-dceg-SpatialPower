import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { InputForm } from './input-form';
import { Results } from './results';
import { postJSON } from '../../services/query';

export function Calculate() {
    const [params, setParams] = useState({});
    const [results, setResults] = useState({});
    const [messages, setMessages] = useState([]);

    async function handleSubmit(params) {
        setParams(params);
        setResults({});
        setMessages([]);

        try {
            console.log(params);
            const results = await postJSON('submit', params);

            if (params.queue) {
                // if the request was enqueued, notify the user
                setMessages([{type: 'primary', text: `Your request has been enqueued, and results will be sent to: ${params.email}.`}]);
            } else {
                // otherwise, show results
                setResults(results);
            }

        } catch (error) {
            setMessages([{type: 'danger', text: error}]);
        }
    }

    function removeMessage(index) {
        setMessages(messages.filter((e, i) => i !== index))
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
                        {messages.map((message, i) => <Alert variant={message.type} dismissible onClose={e => removeMessage(i)}>{message.text}</Alert>)}
                        {<Results results={results} />}
                    </div>
                </div>
            </div>
        </div>
    </div>

}