import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getInputEventValue } from './utils';
import { actions } from '../../services/store/params';

export function PlotOptions({ onSubmit = e => { } }) {
    const dispatch = useDispatch();
    const params = useSelector(state => state.params);
    const { plots } = useSelector(state => state.results);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const [selectedAccordionPanel, setSelectedAccordionPanel] = useState(null);
    const isMac = /Mac|iPhone|iPod|iPad/.test(navigator.platform);

    if (!plots || !plots.length) return null;

    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(params);
        }
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        mergeParams({ [name]: value });
    }

    function checkRequired() {

        if (params.cascon)
            return params.upper_tail

        return true;
    }

    return <Accordion onSelect={setSelectedAccordionPanel}>
        <Card className="shadow-sm mb-3">
            <Accordion.Toggle as={Card.Header} eventKey="0" role="button">
                <h2 className="h6 my-1 mr-2 d-inline-block">Customize Plot Settings</h2>
                <img src={`assets/icons/${selectedAccordionPanel === '0' ? 'angle-up' : 'angle-down'}.svg`} width="12" alt="toggle icon" />
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <form>
                        <div className="row mb-2">

                            <div className="col-lg form-inline mt-lg-3 mb-lg-0 mb-3">
                                <div className="form-group custom-control custom-checkbox mr-3">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="title"
                                        name="title"
                                        checked={params.title}
                                        onChange={handleChange} />
                                    {params.final_sims > 1 && <OverlayTrigger overlay={<Tooltip id="title_tooltip">If checked, display plot titles.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="title">Display Plot Titles</label>
                                    </OverlayTrigger>}

                                    {params.final_sims === 1 && <OverlayTrigger overlay={<Tooltip id="title_tooltip">If checked, display plot titles.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="title">Display Plot Title</label>
                                    </OverlayTrigger>}
                                </div>

                                <div className="form-group custom-control custom-checkbox mr-3">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="axes"
                                        name="axes"
                                        checked={params.axes}
                                        onChange={handleChange} />
                                    <OverlayTrigger overlay={<Tooltip id="title_tooltip">If checked, display x and y axes alongside the plot.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="axes">Display Axes</label>
                                    </OverlayTrigger>
                                </div>

                                {params.final_sims > 1 && <div className="form-group custom-control custom-checkbox mr-3">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="horizontal"
                                        name="horizontal"
                                        checked={params.horizontal}
                                        onChange={handleChange} />
                                    <OverlayTrigger overlay={<Tooltip id="title_tooltip">If checked, display legend horizontally below each plot.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="horizontal">Horizontal</label>
                                    </OverlayTrigger>
                                </div>}

                                {params.final_sims > 1 && <div className="form-group custom-control custom-checkbox mr-3">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="plot_pts"
                                        name="plot_pts"
                                        checked={params.plot_pts}
                                        onChange={handleChange} />
                                    <OverlayTrigger overlay={<Tooltip id="title_tooltip">If checked, display points from the first simulation iteration on the second plot.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="plot_pts">Display Simulated Points</label>
                                    </OverlayTrigger>
                                </div>}

                                {params.final_sims > 1 && <div className="form-group custom-control custom-checkbox">
                                    <input
                                        type="checkbox"
                                        className="custom-control-input"
                                        id="cascon"
                                        name="cascon"
                                        checked={params.cascon}
                                        onChange={handleChange} />
                                    <OverlayTrigger overlay={<Tooltip id="cascon_tooltip">If checked, display statistical power for both case and control clusters. If not, display power for case clusters only.</Tooltip>}>
                                        <label className="custom-control-label" htmlFor="cascon">Display Control Clusters</label>
                                    </OverlayTrigger>
                                </div>}
                            </div>
                        </div>

                        <div className="row" style={{ width: '85%' }}>

                            <div className="col-lg form-group">
                                <label htmlFor="case_symbol" className="text-nowrap">Case Symbol</label>
                                <OverlayTrigger overlay={<Tooltip id="case_symbol_tooltip">Select the case symbol</Tooltip>}>
                                    {/* Use unicode icons as fallbacks, since native Mac OS selects in Safari/Chrome do not support custom webfonts in select options */}
                                    <select
                                        id="case_symbol"
                                        name="case_symbol"
                                        className="custom-select r-symbols"
                                        value={params.case_symbol}
                                        onChange={handleChange}>
                                        <option value="" hidden>(select option)</option>
                                        <option value="16">Closed Circle ({isMac ? '\u25cf' : '\ue810'})</option>
                                        <option value="1">Open Circle ({isMac ? '\u25cb' : '\ue801'})</option>
                                        <option value="0">Open Square ({isMac ? '\u25a1' : '\ue800'})</option>
                                        <option value="3">Plus ({isMac ? '\uff0b' : '\ue803'})</option>
                                        <option value="8">Star ({isMac ? '\ufe61' : '\ue808'})</option>
                                        <option value="4">Cross ({isMac ? '\u2a09' : '\ue804'})</option>
                                    </select>
                                </OverlayTrigger>
                            </div>

                            <div className="col-lg form-group">
                                <label htmlFor="case_color" className="text-nowrap">Case Symbol Color</label>
                                <OverlayTrigger overlay={<Tooltip id="case_color_tooltip">Select the color of case symbols</Tooltip>}>
                                    <select
                                        id="case_color"
                                        name="case_color"
                                        className="custom-select"
                                        value={params.case_color}
                                        onChange={handleChange}>
                                        <option value="" hidden>(select option)</option>
                                        <option value="red">Red</option>
                                        <option value="orange">Orange</option>
                                        <option value="yellow">Yellow</option>
                                        <option value="green">Green</option>
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                        <option value="black">Black</option>
                                        <option value="white">White</option>
                                        <option value="grey">Grey</option>
                                    </select>
                                </OverlayTrigger>
                            </div>

                            <div className="col-lg form-group">
                                <label htmlFor="case_size" className="text-nowrap">Case Symbol Size</label>
                                <OverlayTrigger overlay={<Tooltip id="case_size_tooltip">Specify a numeric value for the size of case symbols</Tooltip>}>
                                    <input
                                        type="number"
                                        step="any"
                                        min="0"
                                        id="case_size"
                                        name="case_size"
                                        className="form-control"
                                        value={params.case_size === 0 ? '' : params.case_size}
                                        onChange={handleChange} />
                                </OverlayTrigger>
                            </div>
                        </div>

                        <div className="row" style={{ marginLeft: '0', marginRight: '0' }}>
                            <div className="row" style={{ width: '85%' }}>
                                <div className="col-lg form-group">
                                    <label htmlFor="control_symbol" className="text-nowrap">Control Symbol</label>
                                    <OverlayTrigger overlay={<Tooltip id="control_symbol_tooltip">Select the control symbol</Tooltip>}>
                                        {/* Use unicode icons as fallbacks, since native Mac OS selects in Safari/Chrome do not support custom webfonts in select options */}
                                        <select
                                            id="control_symbol"
                                            name="control_symbol"
                                            className="custom-select r-symbols"
                                            value={params.control_symbol}
                                            onChange={handleChange}>
                                            <option value="" hidden>(select option)</option>
                                            <option value="16">Closed Circle ({isMac ? '\u25cf' : '\ue810'})</option>
                                            <option value="1">Open Circle ({isMac ? '\u25cb' : '\ue801'})</option>
                                            <option value="0">Open Square ({isMac ? '\u25a1' : '\ue800'})</option>
                                            <option value="3">Plus ({isMac ? '\uff0b' : '\ue803'})</option>
                                            <option value="8">Star ({isMac ? '\ufe61' : '\ue808'})</option>
                                            <option value="4">Cross ({isMac ? '\u2a09' : '\ue804'})</option>
                                        </select>
                                    </OverlayTrigger>
                                </div>
                                <div className="col-lg form-group">
                                    <label htmlFor="control_color" className="text-nowrap">Control Symbol Color</label>
                                    <OverlayTrigger overlay={<Tooltip id="control_color_tooltip">Select the color of control symbols</Tooltip>}>
                                        <select
                                            id="control_color"
                                            name="control_color"
                                            className="custom-select"
                                            value={params.control_color}
                                            onChange={handleChange}>
                                            <option value="" hidden>(select option)</option>
                                            <option value="red">Red</option>
                                            <option value="orange">Orange</option>
                                            <option value="yellow">Yellow</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="purple">Purple</option>
                                            <option value="black">Black</option>
                                            <option value="white">White</option>
                                            <option value="grey">Grey</option>
                                        </select>
                                    </OverlayTrigger>
                                </div>

                                <div className="col-lg form-group">
                                    <label htmlFor="control_size" className="text-nowrap">Control Symbol Size</label>
                                    <OverlayTrigger overlay={<Tooltip id="control_size_tooltip">Specify a numeric value for the size of control symbols</Tooltip>}>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            id="control_size"
                                            name="control_size"
                                            className="form-control"
                                            value={params.control_size === 0 ? '' : params.control_size}
                                            onChange={handleChange} />
                                    </OverlayTrigger>
                                </div>
                            </div>
                            {params.final_sims === 1 && <div className="form-group">
                                <label htmlFor="replot" className="d-block">&nbsp;</label>
                                <div className="text-center">
                                    <button
                                        id="replot"
                                        type="submit"
                                        className="btn btn-primary mr-1 ml-5"
                                        disabled={!checkRequired()}
                                        onClick={handleSubmit}>
                                        Re-Plot
                                    </button>
                                </div>
                            </div>}
                        </div>

                        {params.final_sims > 1 && <div className="row" style={{ marginLeft: '0', marginRight: '0' }}>
                            <div className="row" style={{ width: '85%' }}>
                                <div className="col-lg form-group">
                                    <label htmlFor="p_thresh" className="text-nowrap">Power Threshold</label>
                                    <OverlayTrigger overlay={<Tooltip id="samp_case_tooltip">Specify a numeric value between 0 and 1 (default = 0.8) for the power threshold.</Tooltip>}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            id="p_thresh"
                                            name="p_thresh"
                                            className="form-control"
                                            value={params.p_thresh}
                                            onChange={handleChange} />
                                    </OverlayTrigger>
                                </div>

                                <div className="col-lg form-group">
                                    <label htmlFor="suff_color" className="text-nowrap">Sufficiently Powered</label>
                                    <OverlayTrigger overlay={<Tooltip id="suff_color_tooltip">Select the color of sufficiently powered regions</Tooltip>}>
                                        <select
                                            id="suff_color"
                                            name="suff_color"
                                            className="custom-select"
                                            value={params.suff_color}
                                            onChange={handleChange}>
                                            <option value="" hidden>(select option)</option>
                                            <option value="red">Red</option>
                                            <option value="orange">Orange</option>
                                            <option value="yellow">Yellow</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="purple">Purple</option>
                                            <option value="black">Black</option>
                                            <option value="white">White</option>
                                            <option value="grey">Grey</option>
                                        </select>
                                    </OverlayTrigger>
                                </div>

                                <div className="col-lg form-group">
                                    <label htmlFor="insuff_color" className="text-nowrap">Insufficiently Powered</label>
                                    <OverlayTrigger overlay={<Tooltip id="insuff_color_tooltip">Select the color of insufficiently powered regions</Tooltip>}>
                                        <select
                                            id="insuff_color"
                                            name="insuff_color"
                                            className="custom-select"
                                            value={params.insuff_color}
                                            onChange={handleChange}>
                                            <option value="" hidden>(select option)</option>
                                            <option value="red">Red</option>
                                            <option value="orange">Orange</option>
                                            <option value="yellow">Yellow</option>
                                            <option value="green">Green</option>
                                            <option value="blue">Blue</option>
                                            <option value="purple">Purple</option>
                                            <option value="black">Black</option>
                                            <option value="white">White</option>
                                            <option value="grey">Grey</option>
                                        </select>
                                    </OverlayTrigger>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="replot" className="d-block">&nbsp;</label>
                                <div className="text-center">
                                    <button
                                        id="replot"
                                        type="submit"
                                        className="btn btn-primary mr-1 ml-5"
                                        disabled={!checkRequired()}
                                        onClick={handleSubmit}>
                                        Re-Plot
                                    </button>
                                </div>
                            </div>
                        </div>}

                    </form>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    </Accordion>
}