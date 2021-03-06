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

    // Valid if value is a number
    function isNumber(value, field) {

        if (isNaN(value)) {
            addMessage({ type: 'danger', text: 'Window Shape: ' + field + ' must be a number' })
            return 1;
        }

        return 0;
    }

    // Valid if first and second input have same dimensions 
    function equalLength(first, second, field) {

        if (first.length !== second.length) {
            addMessage({ type: 'danger', text: field })
            return 1;
        }

        return 0;
    }

    // Valid if all (x,y) coordinates are within the bounds of the window
    function inWindow(x, y, params, field) {

        let { win, x_origin, y_origin, width, height, radius, radius2, angle } = params;
        let valid = 0;

        if (win === 'unit_circle' || win === 'circle') {
            for (let i = 0; i < x.length; i++) {

                const distance = Math.sqrt(Math.pow(x[i] - x_origin, 2) + Math.pow(y[i] - y_origin, 2));

                if (distance > radius) {
                    addMessage({ type: 'danger', text: field + ' cannot be outside the window. Coordinate: (' + x[i] + ',' + y[i] + ')' })
                    valid = 1;
                }
            }
        }

        else if (win === 'unit_square' || win === 'rectangle') {

            if (win === 'unit_square') {
                x_origin = 0;
                y_origin = 0;
                width = 1;
                height = 1;
            }

            for (let i = 0; i < x.length; i++) {

                if (x[i] < x_origin || x[i] > x_origin + width || y[i] < y_origin || y[i] > y_origin + height) {
                    addMessage({ type: 'danger', text: field + ' cannot be outside the window. Coordinate: (' + x[i] + ',' + y[i] + ')' })
                    valid = 1;
                }
            }
        }

        else if (win === 'ellipse') {

            for (let i = 0; i < x.length; i++) {
                const firstCalc = Math.pow(Math.sin(angle) * (x - x_origin) + Math.cos(angle) * (y - y_origin), 2) / Math.pow(radius, 2)
                const secondCalc = Math.pow(Math.sin(angle) * (x - x_origin) + Math.cos(angle) * (y - y_origin), 2) / Math.pow(radius2, 2)

                if ((firstCalc + secondCalc) > 1) {
                    addMessage({ type: 'danger', text: field + ' cannot be outside the window. Coordinate: (' + x[i] + ',' + y[i] + ')' })
                    valid = 1;
                }
            }
        }

        return valid;
    }

    // Valid if all values in param are less than max
    function max(param, max, field) {

        let valid = 0;

        for (let i = 0; i < param.length; i++) {

            if (param[i] > max) {
                addMessage({ type: 'danger', text: field + ' (Value = ' + param[i] + ')' })
                valid = 1;
            }
        }
        return valid;
    }

    function min(param, field) {

        let valid = 0;

        for (let i = 0; i < param.length; i++) {

            if (param[i] < .001) {
                addMessage({ type: 'danger', text: field + ' (Value = ' + param[i] + ')' })
                valid = 1;
            }
        }

        return valid;
    }


    function validation(params) {

        const { win, gis, samp_case, samp_control,
            x_origin, y_origin, x_case, y_case, n_case, s_case, r_case,
            x_control, y_control, s_control, n_control,
            radius, radius2, width, height, sim_total } = params;

        let errors = 0;

        // Window origin coordinates must be numeric
        errors += isNumber(x_origin, 'X Origin')
        errors += isNumber(y_origin, 'Y Origin');

        // X and Y Case must have equal dimensions. If not a gis plot, ensure coordinates are in the window
        errors += equalLength(x_case, y_case, 'Sample Case: X Case and Y Case must have the same number of inputs')
        if (!gis)
            errors += inWindow(x_case, y_case, params, 'Sample Case: X Case and Y Case')

        /* 
        * Only check X and Y control if sample control is MVN
        * X and Y Control must have equal dimensions. If not a gis plot, ensure coordinates are in the window
        */
        if (samp_control === 'MVN') {
            errors += equalLength(x_control, y_control, 'Sample Control: X Control and Y Control must have the same number of inputs')
            if (!gis)
                errors += inWindow(x_control, y_control, params, 'Sample Control: X Control and Y Control')
        }

        errors += min(n_case, 'Sample Case: N Case values must be greater than .001.')

        // N Case must have either 1 or equal number of dimensions as X and Y case
        if (n_case.length !== 1)
            errors += equalLength(n_case, x_case, 'Sample Case: N Case must be 1 dimension or equal to dimension of X and Y Case')

        // Only check S Case if sample case is MVN. S Case must have either 1 or equal number of dimensions as X and Y case
        if (samp_case === 'MVN' && s_case.length !== 1)
            errors += equalLength(s_case, x_case, 'Sample Case: S Case must be 1 dimension or equal to dimension of X and Y Case')

        if (samp_case === 'MVN')
            errors += min(s_case, 'Sample Case: S Case values must be greater than .001.')
        /*
        *  Only check R Case if sample case is MVN
        *  R Case must equal to or less than half the width of the window
        *  For rectangular windows, width = min(height,width)
        */
        if (samp_case !== 'MVN') {

            if (r_case.length !== 1)
                errors += equalLength(r_case, x_case, 'Sample Case: R Case must be 1 dimension or equal to dimension of X and Y Case')

            errors += min(r_case, 'Sample Case: R Case values must be greater than .001.')

            if (win === 'circle' || win === 'unit_circle')
                errors += max(r_case, radius, 'Sample Case: R Case values must be less than half the radius of the window.')

            else if (win === 'rectangle' || win === 'unit_square')
                errors += max(r_case, Math.min(width / 2, height / 2), 'Sample Case: R Case values must be less than half the width of the window.')

            else if (win === 'ellipse')
                errors += max(r_case, Math.min(radius / 2, radius2 / 2), 'Sample Case: R Case values must be less than half the smallest radius of the window')
        }

        errors += min(n_control, 'Sample Control: N Control values must be greater than .001.')

        // N Control must have either 1 or equal number of dimensions as X and Y control
        if (n_control.length !== 1)
            errors += equalLength(n_control, x_control, 'Sample Case: N Control must be 1 dimension or equal to dimension of X and Y Control')

        if (samp_control === 'MVN')
            errors += min(s_control, 'Sample Control: S Control values must be greater than .001.')

        // Only check S Control if sample case is MVN. S Control must have either 1 or equal number of dimensions as X and Y Control
        if (samp_control === 'MVN' && s_control.length !== 1)
            errors += equalLength(s_control, x_control, 'Sample Control: S Control must be 1 dimension or equal to dimension of X and Y Control')

        if (gis && sim_total <= 1) {
            errors += 1;
            addMessage({ type: 'danger', text: 'When GIS option is selected, number of simulations must be greater than or equal to 2' })
        }

        return errors === 0
    }

    function convertToMeters(params) {
        const multiplier = {
            km: 1e3
        }[params.unit];

        const newParams = { ...params };

        ['r_case', 's_case', 's_control'].forEach(type => {
            const convert = []
            for (var i = 0; i < params[type].length; i++) {
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

        mergeParams(params);
        resetResults();
        resetMessages();
        window.scrollTo(0, 0);

        if (validation(params)) {
            try {

                let convertParams = params;
                if (params.gis && params.unit !== 'm')
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
        <LoadingOverlay active={results.loading} overlayStyle={{ position: 'fixed' }} />
        <div className="row">
            <div className="col-xl-7 mb-3">
                <Card className="shadow-sm h-100">
                    <Card.Body>
                        <InputForm params={params} onSubmit={handleSubmit} onReset={handleReset} />
                    </Card.Body>
                </Card>
            </div>
            <div className="col-xl-17 mb-3">
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
                            <Card.Text>Calculate statistical power for the spatial relative risk (SRR) function, which is a spatial cluster detection technique that compares two groups of point-level data. Specify the study-design simulation configurations on the left panel. The results will be displayed here once you click on the Submit button.</Card.Text>
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