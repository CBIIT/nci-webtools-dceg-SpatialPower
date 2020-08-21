import React, { useEffect, useCallback } from 'react';
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

    /** Load results when match.params change */
    const { id } = match.params;
    const _loadResults = useCallback(loadResults, [id])
    useEffect(_ => {_loadResults(id)}, [id, _loadResults]);

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
            const response = await postJSON('api/submit', params);

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
            mergeResults(await postJSON(`api/replot`, { ...params, id }));
        } catch (error) {
            mergeMessages([{ type: 'danger', text: error }]);
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({ loading: false, submitted: true, urlKey });
        }
    }

    /**
     * Generates and downloads an archive containing exported plots
     * @param {object} params 
     */
    async function handleExportPlots(params) {
        try {
            const { id } = results;
            mergeResults({ loading: true });
            const filename = await postJSON('api/export-plots', { ...params, id });
            const exportUrl = `${process.env.REACT_APP_API_ROOT}api/results/${id}/${filename}`;
            window.location.href = exportUrl;
        } catch (error) {
            mergeMessages([{ type: 'danger', text: error }]);
        } finally {
            mergeResults({ loading: false });
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
        if (!id) return;
        resetResults();
        resetMessages();
    
        try {
            mergeResults({ loading: true });
            mergeResults(await fetchJSON(`api/fetch-results/${id}`));
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
            <div className="col-lg-4 mb-3">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        <InputForm onSubmit={handleSubmit} onReset={handleReset} />
                    </Card.Body>
                </Card>
            </div>
            <div className="col-lg-8 mb-3">
                {messages.map((message, i) =>
                    <Alert
                        className="white-space-pre-wrap"
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
                        <PlotOptions onSubmit={handleReplot} onExport={handleExportPlots} />
                        <Plots />
                    </>}
            </div>
        </div>
    </div>
}