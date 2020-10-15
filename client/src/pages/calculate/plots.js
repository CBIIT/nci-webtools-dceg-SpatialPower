import React, { createRef, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import { useSelector, useDispatch } from 'react-redux';
import JSZip from 'jszip'
import saveAs from 'file-saver';

import { getInputEventValue } from './utils';
import { actions } from '../../services/store/params';

export function Plots() {
    const dispatch = useDispatch();
    let { id, plots, urlKey } = useSelector(state => state.results);
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const plotRefs = useRef(plots.map(_ => createRef()));

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    if (!plots || !plots.length) return null;

    async function handleExport(event) {
        event.preventDefault();
        setShow(false);

        const archive = new JSZip();
        const images = plotRefs.current.map(el => el.current);

        for (let i = 0; i < images.length; i ++) {
            const filename = `${[
                'data-simulation', 
                'continuous-power', 
                'categorical-power'
            ][i]}.${params.plot_format}`;
            const image = images[i];

            // create canvas to export image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.width = params.plot_width;
            canvas.height = params.plot_height;

            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // preserve square aspect ratio
            const imageSize = Math.min(canvas.width, canvas.height);
            const xOffset = (canvas.width - imageSize) / 2;
            const yOffset = (canvas.height - imageSize) / 2;
            context.drawImage(image, xOffset, yOffset, imageSize, imageSize);

            // add image to archive
            const contents = canvas.toDataURL().replace(/^data:.*base64,/, '')
            archive.file(filename, contents, {base64: true});
        }

        const content = await archive.generateAsync({type: 'blob'});
        saveAs(content, 'export.zip');
        return false;
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        mergeParams({ [name]: value });
    }

    const plotNames = [
        'Data Simulation',
        'Continuous Power',
        'Categorical Power'
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
                        <img ref={plotRefs.current[i]} id={`plot-${i}`} className="img-fluid" src={`api/results/${id}/${plot}?key=${urlKey}`} alt={`Plot ${i + 1}`} />
                    </Tab.Pane>)}
                </Tab.Content>
            </Card.Body>
        </Card>
    </Tab.Container>
}