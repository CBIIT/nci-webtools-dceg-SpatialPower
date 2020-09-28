import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import { useSelector, useDispatch } from 'react-redux';
import { getInputEventValue } from './utils';
import { actions } from '../../services/store/params';

export function Plots({ onExport = e => { } }) {
    const dispatch = useDispatch();
    let { id, plots, urlKey } = useSelector(state => state.results);
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const [show, setShow] = useState(false)

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    if (!plots) return null;
    if (!Array.isArray(plots)) plots = [plots];
    if (params.final_sims === 1) plots = [plots[0]];
    
    function handleExport(event) {
        event.preventDefault();
        setShow(false);
        if (onExport) {
            onExport(params);
        }
        return false;
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        mergeParams({ [name]: value });
    }

    const plotNames = [
        'Simulated Data (First Iteration)',
        'Local Power (Continuous Scale)',
        'Local Power (Above Threshold)'
    ];

    return <Tab.Container id="plots-container" defaultActiveKey="plot-0">
        <Card className="shadow-sm mb-3">
            <Card.Header className="bg-white">
                <div className="d-flex align-items-center">
                    <Nav variant="tabs">
                        {plots.map((plot, i) => <Nav.Item key={`plot-tab-${i}`}>
                            <Nav.Link eventKey={`plot-${i}`} className="font-weight-bold">{plotNames[i]}</Nav.Link>
                        </Nav.Item>)}
                    </Nav>
                    <button
                        id="export"
                        className="btn btn-outline-primary ml-auto"
                        onClick={handleShow}>
                        Export
                    </button>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header>
                            Export Options
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-lg form-group">
                                    <label htmlFor="plot_format" className="font-weight-bold text-nowrap">Image Format</label>
                                    <select
                                        id="plot_format"
                                        name="plot_format"
                                        className="custom-select"
                                        value={params.plot_format}
                                        onChange={handleChange}>
                                        <option value="" hidden>(select option)</option>
                                        <option value="png">png</option>
                                        <option value="jpeg">jpeg</option>
                                        <option value="tiff">tiff</option>
                                        <option value="bmp">bmp</option>
                                    </select>
                                </div>
                                <div className="col-lg form-group">
                                    <label htmlFor="plot_width" className="font-weight-bold text-nowrap">Image Width</label>
                                    <input
                                        type="number"
                                        step="any"
                                        id="plot_width"
                                        name="plot_width"
                                        className="form-control"
                                        value={params.plot_width === 0 ? '' : params.plot_width}
                                        onChange={handleChange} />
                                </div>
                                <div className="col-lg form-group">
                                    <label htmlFor="plot_height" className="font-weight-bold text-nowrap">Image Height</label>
                                    <input
                                        type="number"
                                        step="any"
                                        id="plot_height"
                                        name="plot_height"
                                        className="form-control"
                                        value={params.plot_height === 0 ? '' : params.plot_height}
                                        onChange={handleChange} />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={handleExport}>
                                Export
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Card.Header>
            <Card.Body>
                <Tab.Content className="text-center">
                    {plots.map((plot, i) => <Tab.Pane key={`plot-tab-container-${i}`} eventKey={`plot-${i}`}>
                        <img className="img-fluid" style={{maxWidth: '480px',maxHeight: '480px'}} src={`api/results/${id}/${plot}?key=${urlKey}`} alt={`Plot ${i + 1}`} />
                    </Tab.Pane>)}
                </Tab.Content>
            </Card.Body>
        </Card>
    </Tab.Container>
}