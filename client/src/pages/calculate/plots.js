import React, { createRef, useEffect, useRef, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button'
import { useSelector, useDispatch } from 'react-redux';
import { Map, TileLayer, Polygon } from 'react-leaflet';
import JSZip from 'jszip'
import saveAs from 'file-saver';
import html2canvas from 'html2canvas';
import { getInputEventValue } from './utils';
import { actions } from '../../services/store/params';

export function Plots() {
    const dispatch = useDispatch();
    let { id, data: mapData, plots, urlKey } = useSelector(state => state.results);
    const params = useSelector(state => state.params);
    const mergeParams = value => dispatch(actions.mergeParams(value));
    const plotRefs = useRef((plots && plots.length ? plots : []).map(_ => createRef()));
    const mapRef = useRef(null);

    const [show, setShow] = useState(false);
    const [activeKey, setActiveKey] = useState('plot-0')

    const handleClose = () => setShow(false);
    const handleShow = () => {
        setShow(true)
        handleSelect('plot-gis')
    }

    async function handleExport(event) {
        event.preventDefault();
        setShow(false);
        window.scrollTo(0, 0);

        const archive = new JSZip();
        const images = plotRefs.current.map(el => el.current);

        for (let i = 0; i < images.length; i++) {
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

            // draw image to canvas
            // note: IE will mark the canvas as tainted if an svg is used as the source
            // regardless of whether the image is from the same origin or not
            context.drawImage(image, xOffset, yOffset, imageSize, imageSize);

            // as a result, this step will fail on IE
            // todo: on IE, implement a fallback export for the original plot image and remove
            // other formats as options
            const contents = canvas
                .toDataURL(`image/${params.plot_format}`)
                .replace(/^data:.*base64,/, '');

            // add image to archive
            archive.file(filename, contents, { base64: true });
        }

        if (params.gis && mapRef.current) {

            const canvas = await html2canvas(document.querySelector('#map-container'), {
                useCORS: true, 
                ignoreElements: el => el.className === 'leaflet-top leaflet-left'
            });

            const contents = canvas
                .toDataURL(`image/${params.plot_format}`)
                .replace(/^data:.*(base64)?,/, '');

            if (contents.length)
                archive.file(`map.${params.plot_format}`, contents, { base64: true });

            
        }

        const content = await archive.generateAsync({ type: 'blob' });
        saveAs(content, 'export.zip');
        return false;
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        mergeParams({ [name]: value });
    }

    function handleSelect(event) {
        setActiveKey(event)

        if (event === 'plot-gis') {
            // because the map is initially offscreen, we need to 
            // manually invalidate its size and reset its bounds when
            // it becomes visible
            setTimeout(() => {
                let map = mapRef.current.leafletElement;
                map.invalidateSize();
                map.fitBounds([
                    [mapData.bbox[1][0], mapData.bbox[0][0]],
                    [mapData.bbox[1][1], mapData.bbox[0][1]]
                ])
            }, 0);
        }
    }

    const plotNames = [
        'Data Simulation',
        'Continuous Power',
        'Categorical Power'
    ];

    // assign colors to categorical values
    const categories = [
        { value: 1, label: 'Insufficient', color: params.insuff_color },
        { value: 2, label: 'Sufficient', color: params.suff_color },
    ];

    const polygons = (mapData ? mapData.polygons : []).map(({ Polygons }, i) => {
        const data = mapData.data[i];
        const category = categories.find(e => e.value === data.layer);
        const color = category ? category.color : params.insuff_color;
        const paths = Polygons.map(p => p.coords.map(([lng, lat]) => [lat, lng]))
        return { paths, color };
    });

    if (!plots || !plots.length) return null;

    return <Tab.Container id="plots-container" activeKey={activeKey} onSelect={handleSelect}>
        <Card className="shadow-sm mb-3">
            <Card.Header className="bg-white">
                <div className="d-flex align-items-center">
                    <Nav variant="tabs">
                        {plots.map((plot, i) => <Nav.Item key={`plot-tab-${i}`}>
                            <Nav.Link eventKey={`plot-${i}`} className="font-weight-bold">{plotNames[i]}</Nav.Link>
                        </Nav.Item>)}
                        {params.gis && <Nav.Item>
                            <Nav.Link eventKey={`plot-gis`} className="font-weight-bold">GIS</Nav.Link>
                        </Nav.Item>}
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
                                        value={params.plot_width}
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
                                        value={params.plot_height}
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
                        <img
                            ref={plotRefs.current[i]}
                            className="img-fluid"
                            src={`api/results/${id}/${plot}?key=${urlKey}`}
                            alt={`Plot ${i + 1}`}
                        />
                    </Tab.Pane>)}
                    {params.gis && <Tab.Pane key={`plot-tab-container-gis`} eventKey={`plot-gis`}>
                        <div id="map-container">
                            <Map style={{ height: '800px' }} ref={mapRef} center={[0, 0]} zoom={10} preferCanvas>
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    maxZoom={19}
                                />
                                {polygons.map(p => <Polygon positions={p.paths} color={p.color} opacity={0} fillOpacity={0.4} />)}
                            </Map>
                            {categories.map(({ label, color }) => <span className="d-inline-block mx-3 mt-1">
                                <span className="d-inline-block mr-1" style={{
                                backgroundColor: color,
                                width: '24px'
                                }}>&nbsp;</span>
                                {label}
                            </span>)}
                        </div>
                    </Tab.Pane>}
                </Tab.Content>
            </Card.Body>
        </Card>

    </Tab.Container>
}