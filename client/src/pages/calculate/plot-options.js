import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Icon from '@cbiitss/react-components';
import { getInputEventValue } from './utils';
import { actions } from '../../services/store/params';

export function PlotOptions({ onSubmit = e => { } }) {
    const dispatch = useDispatch();
    const params = useSelector(state => state.params);
    const { plots } = useSelector(state => state.results);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const [selectedAccordionPanel, setSelectedAccordionPanel] = useState(null);
    if (!plots || !plots.length) return null;

    function handleSubmit(event) {
        event.preventDefault();
        if (onSubmit) {
            onSubmit(params);
        }
        return false;
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        mergeParams({ [name]: value });
    }

    return <Accordion onSelect={setSelectedAccordionPanel}>
        <Card className="shadow-sm mb-3">
            <Accordion.Toggle as={Card.Header} eventKey="0" role="button">
                <h2 className="h6 my-1 mr-2 d-inline-block">Customize Plot Settings</h2> 
                <img src={`assets/icons/${selectedAccordionPanel === '0' ? 'angle-up' : 'angle-down'}.svg`} width="12" alt="toggle-icon" />
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    <form>
                        <div className="d-flex flex-row">
                            <div className="form-group d-flex flex-column">
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
                            <div className="d-flex flex-column ml-4 pt-2">
                                <label htmlFor="replot"><span>&nbsp;</span></label>
                                <div className="d-flex flex-row" style={{ gap: '20px' }}>
                                    <div className="form-group custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="plot_pts"
                                            name="plot_pts"
                                            checked={params.plot_pts}
                                            onChange={handleChange} />

                                        <OverlayTrigger
                                            placement="right"
                                            overlay={<Tooltip id="title_tooltip">If checked, the points from the first simulation iteration will be added to second plot.</Tooltip>}>
                                            <label className="custom-control-label" htmlFor="plot_pts">Plot Points</label>
                                        </OverlayTrigger>
                                    </div>

                                    <div className="form-group custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="title"
                                            name="title"
                                            checked={params.title}
                                            onChange={handleChange} />

                                        <OverlayTrigger
                                            placement="right"
                                            overlay={<Tooltip id="title_tooltip">If checked, display title of plots</Tooltip>}>
                                            <label className="custom-control-label" htmlFor="title">Display Plot Titles</label>
                                        </OverlayTrigger>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-row" style={{ gap: '7px' }}>
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="suff_color" className="font-weight-bold">Sufficiently Powered</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="suff_color_tooltip">Select the color of sufficiently powered regions</Tooltip>}>
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
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="mid_color" className="font-weight-bold">Mid-point Color</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="mid_color_tooltip">Select the color of the mid-point</Tooltip>}>
                                    <select
                                        id="mid_color"
                                        name="mid_color"
                                        className="custom-select"
                                        value={params.mid_color}
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
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="insuff_color" className="font-weight-bold">Insufficiently Powered</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="insuff_color_tooltip">Select the color of insufficiently powered regions</Tooltip>}>
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
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="case_color" className="font-weight-bold">Case Location Color</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="case_color_tooltip">Select the color of case symbols</Tooltip>}>
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
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="control_color" className="font-weight-bold">Control Location Color</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="control_color_tooltip">Select the color of control symbols</Tooltip>}>
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
                        </div>

                        <div className="d-flex flex-row" style={{ gap: '7px' }}>
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="case_symbol" className="font-weight-bold">Case Symbol</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="case_symbol_tooltip">Select the case symbol</Tooltip>}>
                                    <select
                                        id="case_symbol"
                                        name="case_symbol"
                                        className="custom-select"
                                        type="number"
                                        value={params.case_symbol}
                                        onChange={handleChange}>
                                        <option value="" hidden>(select option)</option>
                                        <option value="16">Closed Circle</option>
                                        <option value="1">Open Circle</option>
                                        <option value="0">Open Square</option>
                                        <option value="3">Plus Sign</option>
                                        <option value="8">Star</option>
                                        <option value="4">X</option>
                                    </select>
                                </OverlayTrigger>
                            </div>
                            <div className="form-group d-flex flex-column flex-fill">
                                <label htmlFor="control_symbol" className="font-weight-bold">Control Symbol</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="control_symbol_tooltip">Select the control symbol</Tooltip>}>
                                    <select
                                        id="control_symbol"
                                        name="control_symbol"
                                        className="custom-select"
                                        type="number"
                                        value={params.control_symbol}
                                        onChange={handleChange}>
                                        <option value="" hidden>(select option)</option>
                                        <option value="16">Closed Circle</option>
                                        <option value="1">Open Circle</option>
                                        <option value="0">Open Square</option>
                                        <option value="3">Plus Sign</option>
                                        <option value="8">Star</option>
                                        <option value="4">X</option>
                                    </select>
                                </OverlayTrigger>
                            </div>

                            <div className="form-group d-flex flex-column flex-fill" style={{maxWidth: '19%'}}>
                                <label htmlFor="case_size" className="font-weight-bold">Case Symbol Size</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="case_size_tooltip">Specify a numeric value for the size of case symbols</Tooltip>}>
                                    <input
                                        type="number"
                                        step="any"
                                        id="case_size"
                                        name="case_size"
                                        className="form-control"
                                        value={params.case_size}
                                        onChange={handleChange} />
                                </OverlayTrigger>
                            </div>

                            <div className="form-group d-flex flex-column flex-fill" style={{maxWidth:'19%'}}>
                                <label htmlFor="control_size" className="font-weight-bold">Control Symbol Size</label>
                                <OverlayTrigger
                                    placement="right"
                                    overlay={<Tooltip id="control_size_tooltip">Specify a numeric value for the size of control symbols</Tooltip>}>
                                    <input
                                        type="number"
                                        step="any"
                                        id="control_size"
                                        name="control_size"
                                        className="form-control"
                                        value={params.control_size}
                                        onChange={handleChange} />
                                </OverlayTrigger>
                            </div>

                            <div className="d-flex flex-column flex-fill ml-5">
                                <label htmlFor="replot"><span>&nbsp;</span></label>
                                <div className="d-flex justify-content-center">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        onClick={handleSubmit}>
                                        Re-Plot
                                    </button>
                                </div>
                            </div>
                        </div>


                    </form>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    </Accordion>
}