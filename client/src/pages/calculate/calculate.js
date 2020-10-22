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
    const params = useSelector(state => state.params)
    const results = useSelector(state => state.results);
    const messages = useSelector(state => state.messages);
    const addMessage = message => dispatch(actions.addMessage(message));
    const mergeResults = results => dispatch(actions.mergeResults(results));
    const mergeParams = params => dispatch(actions.mergeParams(params));
    const resetParams = _ => dispatch(actions.resetParams());
    const resetResults = _ => dispatch(actions.resetResults());
    const resetMessages = _ => dispatch(actions.resetMessages());
    const removeMessageByIndex = index => dispatch(actions.removeMessageByIndex(index));

    /** Load results when match.params change */
    const { id } = match.params;
    const _loadResults = useCallback(loadResults, [id])
    useEffect(_ => { _loadResults(id) }, [id, _loadResults]);

    function validateInput(params) {

        let valid = true;
        let { samp_case, unit, samp_control, x_origin, y_origin, radius, width, height, x_case, y_case, x_control, y_control, n_case, n_control, s_case, r_case, s_control } = params;
        let names = ["X Case", "Y Case", "X Control", "Y Control"]
        let i = 0;

        //X and Y Origin must be numeric
        if (isNaN(x_origin) || isNaN(y_origin)) {
            addMessage({ type: 'danger', text: 'Window Shape: X Origin and Y Origin must be numbers' })
            valid = false;
        }

        //X and Y case must have the same dimension
        if (x_case.length !== y_case.length) {
            addMessage({ type: 'danger', text: 'Sample Case: X Case and Y Case must have the same number of inputs' })
            valid = false;
        }
        //Determine if every coordinate is within the window
        else if (!params.gis) {

            if (params.win === 'unit_circle' || params.win === 'circle') {
                for (let i = 0; i < x_case.length; i++) {

                    const distance = Math.sqrt(Math.pow(x_case[i] - x_origin, 2) + Math.pow(y_case[i] - y_origin, 2));

                    if (distance > radius) {
                        addMessage({ type: 'danger', text: 'Sample Case: X Case and Y Case cannot be outside the window. Coordinate: (' + x_case[i] + ',' + y_case[i] + ')' })
                        valid = false;
                    }
                }
            }

            else if (params.win === 'unit_square' || params.win === 'rectangle') {

                if (params.win === 'unit_square') {
                    x_origin = 0;
                    y_origin = 0;
                    width = 1;
                    height = 1;
                }

                for (let i = 0; i < x_case.length; i++) {

                    if (x_case[i] < x_origin || x_case[i] > x_origin + width || y_case[i] < y_origin || y_case[i] > y_origin + height) {
                        addMessage({ type: 'danger', text: 'Sample Case: X Case and Y Case cannot be outside the window. Coordinate: (' + x_case[i] + ',' + y_case[i] + ')' })
                        valid = false;
                    }
                }
            }

        }

        //Only check X and Y control if samp_control is MVN
        if (samp_control === 'MVN') {

            //X and Y control must have the same dimension
            if (x_control.length !== y_control.length) {
                addMessage({ type: 'danger', text: 'Sample Control: X Control and Y Control must have the same number of inputs' })
                valid = false;
            }

            //Determine if every coordinate is within bounds
            else if (!params.gis) {

                if (params.win === 'unit_circle' || params.win === 'circle') {
                    for (let i = 0; i < x_control.length; i++) {

                        const distance = Math.sqrt(Math.pow(x_control[i] - x_origin, 2) + Math.pow(y_control[i] - y_origin, 2));

                        if (distance > radius) {
                            addMessage({ type: 'danger', text: 'Sample Control: X Control and Y Control cannot be outside the window. Coordinate: (' + x_control[i] + ',' + y_control[i] + ')' })
                            valid = false;
                        }
                    }
                }

                else if (params.win === 'unit_square' || params.win === 'rectangle') {

                    if (params.win === 'unit_square') {
                        x_origin = 0;
                        y_origin = 0;
                        width = 1;
                        height = 1;
                    }

                    for (let i = 0; i < x_case.length; i++) {

                        if (x_control[i] < x_origin || x_control[i] > x_origin + width || y_control[i] < y_origin || y_control[i] > y_origin + height) {
                            addMessage({ type: 'danger', text: 'Sample Control: X Control and Y Control cannot be outside the window. Coordinate: (' + x_control[i] + ',' + y_control[i] + ')' })
                            valid = false;
                        }
                    }
                }
            }
        }

        i = 0;
        let cases;

        /*The dimension of N Case, S Case, and R Case must be either:
        *  -Equal to 1 
        *  -Equal to the dimension of X and Y Case
        * 
        * S Case only needs to be checked when Sample Case is MVN
        */
        if (samp_case === 'MVN')
            cases = [n_case, s_case];
        else
            cases = [n_case];

        names = ["N Case", "S Case"];

        cases.forEach((case_type) => {
            if (case_type.length !== x_case.length && case_type.length !== 1) {
                addMessage({ type: 'danger', text: 'Sample Case: ' + names[i] + ' must be 1 dimension or equal to dimension of X and Y Case' })
                valid = false;
            }

            //N and S Case Values must be positive
            case_type.forEach((value) => {

                if (value <= 0) {
                    addMessage({ type: 'danger', text: 'Sample Case: ' + names[i] + ' values must be positive. (Value = ' + value + ')' })
                    valid = false;
                }
            });

            i += 1;
        });

        //Only check R Case if needed
        if (samp_case === 'uniform' || samp_case === 'CSR') {

            if (r_case.length !== x_case.length && r_case.length !== 1) {
                addMessage({ type: 'danger', text: 'Sample Case: R Case must be 1 dimension or equal to dimension of X and Y Case' })
                valid = false;
            }

            let half;
            if (params.win === 'circle' || params.win === 'unit_circle')
                half = radius;
            else
                half = Math.min(width / 2, height / 2);

            //R Case values must be less than half the width of the window
            r_case.forEach((value) => {

                if (value > half) {
                    addMessage({ type: 'danger', text: 'Sample Case: R Case values must be less than half the width of the window. (Value = ' + value + ')' })
                    valid = false;
                }

                if (value <= 0) {
                    addMessage({ type: 'danger', text: 'Sample Case: R Case values must be a positive. (Value = ' + value + ')' })
                    valid = false;
                }
            });
        }

        i = 0;
        let control;

        /*The dimension of N Control, S Control, and R Control must be either:
        *  -Equal to 1 
        *  -Equal to the dimension of X and Y Control
        */
        if (samp_control === 'MVN')
            control = [n_control, s_control];
        else
            control = [n_control];

        names = ["N Control", "S Control"];

        control.forEach((control_type) => {

            if (control_type.length !== x_case.length && control_type.length !== 1) {
                addMessage({ type: 'danger', text: 'Sample Control: ' + names[i] + ' must be 1 dimension or equal to dimension of X and Y Control' })
                valid = false;
            }

            //N and S Control values must be postive
            control_type.forEach((value) => {

                if (value <= 0) {
                    addMessage({ type: 'danger', text: 'Sample Control: ' + names[i] + ' values must be positive. (Value = ' + value + ')' })
                    valid = false;
                }
            });
            i += 1;
        })

        return valid;
    }

    function convertToMeters(params){
        const multiplier = {
            kilometers: 1e3
        }[params.unit];

        const newParams = {...params};

        ['r_case','s_case','s_control'].forEach(type => {
            const convert = []
            for(var i = 0;i < params[type].length;i++){
                convert[i] = params[type][i] * multiplier;
            }
            newParams[type] = convert;
        });

        return newParams;
    }

    /**
     * Posts calculation parameters to the 'submit' endpoint and saves results to the store
     * @param {object} params 
     */
    async function handleSubmit(params) {
        console.log(params);

        mergeParams(params);
        resetResults();
        resetMessages();
        window.scrollTo(0, 0);

        if (validateInput(params)) {
            try {

                let convertParams = params;
                if(params.gis && params.unit !== 'meters')
                    convertParams = convertToMeters(params);

                mergeResults({ loading: true });
                const response = await postJSON('api/submit', convertParams);

                // If the request was enqueued, notify the user. Otherwise, save results to the store
                params.queue
                    ? addMessage({ type: 'primary', text: `Your request has been enqueued. Results will be sent to: ${params.email}.` })
                    : mergeResults(response);

            } catch (error) {
                addMessage({ type: 'danger', text: error });
            } finally {
                const urlKey = new Date().getTime();
                mergeResults({ loading: false, submitted: true, urlKey });
            }
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
            addMessage({ type: 'danger', text: error });
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({
                loading: false,
                submitted: true,
                urlKey
            });
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
        handleReset();

        try {
            mergeResults({ loading: true });
            const { params, results } = await fetchJSON(`api/fetch-results/${id}`);
            mergeParams(params);
            mergeResults(results);
        } catch (error) {
            addMessage({ type: 'danger', text: `No results were found.` });
        } finally {
            const urlKey = new Date().getTime();
            mergeResults({ loading: false, submitted: true, urlKey });
        }
    }

    return <div className="container py-4">
        <h1 className="sr-only">SparrpowR</h1>
        <LoadingOverlay active={results.loading} />
        <div className="row">
            <div className="col-xl-4 col-lg-4 col-md-5 mb-3">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        <InputForm params={params} onSubmit={handleSubmit} onReset={handleReset} />
                    </Card.Body>
                </Card>
            </div>
            <div className="col-xl-8 col-lg-8 col-md-7 mb-3">
                {messages.map((message, i) =>
                    <Alert
                        className="white-space-pre-wrap"
                        key={`results-alert-${i}`}
                        variant={message.type}
                        dismissible
                        onClose={e => removeMessageByIndex(i)}>
                        {message.text}
                    </Alert>)}

                {!results.submitted && messages.length === 0 ?
                    <Card className="shadow-sm h-100">
                        <Card.Body>
                            <Card.Text>Specify the sample case and control and provide simulation configuration on the left panel. The results will be displayed here once you click on the Submit button.</Card.Text>
                        </Card.Body>
                    </Card> : <>
                        <Summary />
                        <PlotOptions onSubmit={handleReplot} />
                        <Plots />
                    </>}
            </div>
        </div>
    </div>
}