import React, { useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingOverlay } from '@cbiitss/react-components';
import { actions as resultsActions } from '../../services/store/results';
import { actions as messagesActions } from '../../services/store/messages';
import { InputForm } from './input-form';
import { Results } from './results';
import { fetchJSON, postJSON } from '../../services/query';
const actions = {...resultsActions, ...messagesActions};

export function Calculate({match}) {
    const dispatch = useDispatch();
    const results = useSelector(state => state.results);
    const messages = useSelector(state => state.messages);
    const mergeResults = results => dispatch(actions.mergeResults(results));
    const mergeMessages = messages => dispatch(actions.mergeMessages(messages));
    const resetResults = _ => dispatch(actions.resetResults());
    const resetMessages = _ => dispatch(actions.resetMessages());
    const removeMessageByIndex = index => dispatch(actions.removeMessageByIndex(index));

    // run once
    useEffect(() => {
        const { id } = match.params;
        if (id) loadResults(id);
    }, []);

    async function handleSubmit(params) {
        console.log(params);

        resetResults();
        resetMessages();

        try {
            mergeResults({loading: true});
            const results = await postJSON('submit', params);

            if (params.queue) {
                // if the request was enqueued, notify the user
                mergeMessages([{type: 'primary', text: `Your request has been enqueued. Results will be sent to: ${params.email}.`}]);
            } else {
                // otherwise, show results
                mergeResults(results);
            }

        } catch (error) {
            mergeMessages([{type: 'danger', text: error}]);
        } finally {
            mergeResults({loading: false});
        }
    }

    function handleReset() {
        // do not call resetParams, as it initiates handleReset
        resetResults();
        resetMessages();
    }

    async function loadResults(id) {
        resetResults();
        resetMessages();

        try {
            mergeResults({loading: true});
            const results = await fetchJSON(`fetch-results/?id=${id}`);
            if (results) {
                mergeResults(results);
            } else {
                mergeMessages([{type: 'danger', text: `No results could be found for the specified id.`}]);
            }
        } catch (error) {
            mergeMessages([{type: 'danger', text: error}]);
        } finally {
            mergeResults({loading: false});
        }
    }

    return <div className="container py-4">
        <LoadingOverlay active={results.loading} />
        <h1 className="h4 mb-4">Spatial Risk Calculation</h1>
        <div className="row">
            <div className="col-md-4">
                <div className="card shadow-sm h-100">
                    <InputForm className="card-body" onSubmit={handleSubmit} onReset={handleReset}/>
                </div>
            </div>
            <div className="col-md-8">
                <div className="card shadow-sm h-100">
                    <div className="card-body">
                        {messages.map((message, i) => 
                            <Alert 
                                key={`results-alert-${i}`} 
                                variant={message.type} 
                                dismissible 
                                onClose={e => removeMessageByIndex(i)}>
                                {message.text}
                            </Alert>)}
                        {<Results results={results} />}
                    </div>
                </div>
            </div>
        </div>
    </div>
}