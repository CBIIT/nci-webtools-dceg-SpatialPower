import React, { useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Card from 'react-bootstrap/Card';
import { useSelector, useDispatch } from 'react-redux';
import { LoadingOverlay } from '@cbiitss/react-components';
import { actions as paramsActions } from '../../services/store/params';
import { actions as resultsActions } from '../../services/store/results';
import { actions as messagesActions } from '../../services/store/messages';
import { InputForm } from './input-form';
import { Plots } from './plots';
import { Summary } from './summary';
import { fetchJSON, postJSON } from '../../services/query';
import { PlotOptions } from './plot-options';
const actions = { ...paramsActions, ...resultsActions, ...messagesActions };

export function Calculate({ match }) {
    const dispatch = useDispatch();
    const results = useSelector(state => state.results);
    const messages = useSelector(state => state.messages);
    const mergeResults = results => dispatch(actions.mergeResults(results));
    const mergeMessages = messages => dispatch(actions.mergeMessages(messages));
    const resetParams = _ => dispatch(actions.resetParams());
    const resetResults = _ => dispatch(actions.resetResults());
    const resetMessages = _ => dispatch(actions.resetMessages());
    const removeMessageByIndex = index => dispatch(actions.removeMessageByIndex(index));

    /**
     * Loads results from an id, which is specified as a React Router url parameter.
     */
    useEffect(() => {
        const { id } = match.params;
        if (id) loadResults(id);
    });

    /**
     * Posts calculation parameters to the 'submit' endpoint and saves results to the store
     * @param {object} params 
     */
    async function handleSubmit(params) {
        console.log(params);

        resetResults();
        resetMessages();

        try {
            mergeResults({ loading: true });
            const response = await postJSON('submit', params);

            // If the request was enqueued, notify the user. Otherwise, save results to the store
            params.queue
                ? mergeMessages([{ type: 'primary', text: `Your request has been enqueued. Results will be sent to: ${params.email}.` }])
                : mergeResults(response);

        } catch (error) {
            mergeMessages([{ type: 'danger', text: error }]);
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({ loading: false, submitted: true, urlKey });
        }
    }

    /**
     * Replots existing results plots by calling the 'replot' endpoint and updating the cache key
     * @param {object} params 
     */
    async function handleReplot(params) {
        resetMessages();

        try {
            const { id } = results;
            mergeResults({ loading: true, submitted: false });
            mergeResults(await postJSON('replot', { ...params, id }));
        } catch (error) {
            mergeMessages([{ type: 'danger', text: error }]);
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({ loading: false, submitted: true, urlKey });
        }
    }

    /**
     * Resets calculation parameters, results, and messages to their initial state
     */
    function handleReset() {
        resetParams();
        resetResults();
        resetMessages();
    }

    /**
     * Loads calculation results into the store using the specified id.
     * @param {string} id 
     */
    async function loadResults(id) {
        resetResults();
        resetMessages();

        try {
            mergeResults({ loading: true });
            mergeResults(await fetchJSON(`fetch-results/?id=${id}`));
        } catch (error) {
            mergeMessages([{ type: 'danger', text: `No results could be found for the specified id.` }]);
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({ loading: false, submitted: true, urlKey });
        }
    }

    return <div className="container py-4">
        <LoadingOverlay active={results.loading} />
        <div className="row">
            <div className="col-md-4">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        <InputForm onSubmit={handleSubmit} onReset={handleReset} />
                    </Card.Body>
                </Card>
            </div>
            <div className="col-md-8">
                {messages.map((message, i) =>
                    <Alert
                        key={`results-alert-${i}`}
                        variant={message.type}
                        dismissible
                        onClose={e => removeMessageByIndex(i)}>
                        {message.text}
                    </Alert>)}

                {!results.submitted ?
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Text>Specify the sample case and control and provide simulation configuration on the left panel. The results will be displayed here once you click on the Submit button.</Card.Text>
                        </Card.Body>
                    </Card> : <>
                        <Summary />
                        <div className="accordion md-accordion" id="plotAccordion" aria-multiselectable="true">
                            <PlotOptions onSubmit={handleReplot} />
                        </div>
                        <Plots />
                    </>}
            </div>
        </div>
    </div>
}