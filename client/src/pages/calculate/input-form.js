import React, { useState, useEffect } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { getInputEventValue } from './utils';
import { getInitialState } from '../../services/store/params';
import exampleJSON from './files/Washington_DC_Boundary.geojson';
import { Button } from 'react-bootstrap';
import { getRectangularCoordinates, getRegularPolygonalCoordinates, getTargetCoordinates, getEllipticalCoordinates } from '../../services/utils/geospatial';


export function InputForm({
    params: storeParams,
    className = '',
    onSubmit = e => { },
    onReset = e => { }
}) {
    const [params, setParams] = useState(storeParams)
    const mergeParams = value => setParams({ ...params, ...value });
    const resetParams = _ => setParams(getInitialState());
    const simQueueCutoff = 100;
    const [submitted, setSubmitted] = useState(false);
    const [fileError, setFileError] = useState('')
    useEffect(_ => setParams(storeParams), [storeParams]);

    function checkRequired() {

        if (!params.samp_case || !params.samp_control)
            return false;

        if (params.queue) {
            if (!params.email || !params.job_name) {
                return false;
            }
        }

        if (params.gis) {
            return params.unit;
        }

        if (params.samp_case) {
            if (!params.x_case || !params.y_case || !params.r_case || params.s_case < 0 || params.n_case <= 0) {
                return false;
            }
        }
        if (params.samp_control) {
            if (!params.x_control || !params.y_control || !params.s_control < 0 || params.n_control <= 0) {
                return false;
            }
        }

        return params.sim_total > 0 && params.rand_seed > 0 && params.alpha;
    }

    async function handleUpload(file) {

        setFileError('')
        const newParams = { ...params, ['filename']: file.name };
        const reader = new FileReader()
        reader.onloadend = () => {
            try {
                const data = JSON.parse(reader.result)
                newParams.geojson = JSON.stringify({ type: data.features[0].geometry.type, coordinates: data.features[0].geometry.coordinates });
                newParams.longitude = parseFloat(data.features[0].geometry.coordinates[0][0][0].toFixed(4))
                newParams.latitude = parseFloat(data.features[0].geometry.coordinates[0][0][1].toFixed(4))
                mergeParams(newParams);

            } catch (e) {
                setFileError('Error with file, please upload a valid geoJSON file.')
            }
        }
        await reader.readAsText(file, 'UTF-8"')
    }

    function handleLoadFile() {

        setFileError('')
        const newParams = { ...params, ['filename']: 'Washington_DC_Boundary.geojson' };

        fetch(exampleJSON)
            .then(r => r.text())
            .then(text => {

                const data = JSON.parse(text)
                newParams.geojson = JSON.stringify({ type: data.features[0].geometry.type, coordinates: data.features[0].geometry.coordinates });
                newParams.longitude = -77.0409
                newParams.latitude = 38.9096
                newParams.unit = 'km'
                newParams.x_case = [-77.0409]
                newParams.y_case = [38.9096]
               
                newParams.s_case = [2]
                newParams.r_case = [2]

                newParams.x_control = [-77.0409]
                newParams.y_control = [38.9096]                
                newParams.s_control = [5]
                mergeParams(newParams)
            })
    }

    function handleChange(event) {
        const { name, value } = getInputEventValue(event);
        const newParams = { ...params, [name]: value };
        setSubmitted(false)

        // cap maximum number of simulations
        newParams.sim_total = Math.min(50000, newParams.sim_total);

        // force queueing when running over 100 simulations
        if (newParams.sim_total > simQueueCutoff) {
            newParams.queue = true;
        }

        if (name === 'gis' && (newParams.win === 'unit_circle' || newParams.win === 'unit_square'))
            newParams.win = '';

        // set default parameters for unit windows
        if ((name === 'win' || name === 'samp_case') && (newParams.win === 'unit_circle' || newParams.win === 'unit_square')) {

            newParams.x_origin = 0.5;
            newParams.y_origin = 0.5;
            newParams.radius = 0.5;

            newParams.x_case = [0.5]
            newParams.y_case = [0.5]
            newParams.s_case = [0.33]
            newParams.r_case = [0.5]
        }

        if ((name === 'win' || name === 'samp_control') && (newParams.win === 'unit_circle' || newParams.win === 'unit_square')) {
            newParams.x_control = [0.5]
            newParams.y_control = [0.5]
            newParams.s_control = [0.33]
        }

        //Defaults for rectangle windows, updates with window, x_origin, y_origin, width, and height
        if (newParams.win === 'rectangle' && (name === 'gis' || name === 'win' || name === 'x_origin' || name === 'y_origin' || name === 'width' || name === 'height')) {

            if (name === 'win') {
                newParams.x_origin = 0
                newParams.y_origin = 0
                newParams.width = 1
                newParams.height = 2
            }

            newParams.x_case = [Number(newParams.x_origin) + Number([newParams.width / 2])]
            newParams.y_case = [Number(newParams.y_origin) + Number([newParams.height / 2])]
            newParams.r_case = [Math.floor(Math.min(newParams.width / 2, newParams.height / 2) * 10) / 10]
            newParams.s_case = [Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10]

            newParams.x_control = [Number(newParams.x_origin) + Number([newParams.width / 2])]
            newParams.y_control = [Number(newParams.y_origin) + Number([newParams.height / 2])]
            newParams.s_control = [Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10]
        }
        /*
        //Defaults for circular windows, updates with window, x_origin, y_origin, and radius
        else if (newParams.win === "circle" && (name === 'gis' || name === 'win' || name === 'x_origin' || name === 'y_origin' || name === 'radius')) {

            if (name === 'win') {
                newParams.x_origin = 1
                newParams.y_origin = 1
                newParams.radius = 1
            }

            newParams.x_case = [newParams.x_origin]
            newParams.y_case = [newParams.y_origin]
            newParams.r_case = [Math.floor((newParams.radius / 2) * 10) / 10]
            newParams.s_case = [Math.floor((newParams.radius / 3) * 10) / 10]

            newParams.x_control = [newParams.x_origin]
            newParams.y_control = [newParams.y_origin]
            newParams.s_control = [Math.floor((newParams.radius / 3) * 10) / 10]
        }*/
        else if (newParams.win === "ellipse" && (name === 'gis' || name === 'win' || name === 'x_origin' || name === 'y_origin' || name === 'radius' || name === 'radius2' || name === 'angle')) {
            if (name === 'win') {
                newParams.x_origin = 1
                newParams.y_origin = 1
                newParams.radius = 1
                newParams.radius2 = 1
                newParams.angle = 0
            }

            newParams.x_case = [newParams.x_origin]
            newParams.y_case = [newParams.y_origin]
            newParams.x_control = [newParams.x_origin]
            newParams.y_control = [newParams.y_origin]

            newParams.r_case = [Math.floor(Math.min(newParams.radius / 2, newParams.radius2 / 2) * 10) / 10];
            newParams.s_case = [Math.floor(Math.min(newParams.radius / 3, newParams.radius2 / 3) * 10) / 10];

            newParams.s_control = [Math.floor(Math.min(newParams.radius / 3, newParams.radius2 / 3) * 10) / 10];
        }

        // todo: use isDefined (eg: not '', undefined, null) to allow using (0, 0) coordinates
        if (newParams.gis && (name === 'win' || name === 'gis' || name === 'unit' || name === 'longitude' || name === 'latitude' || name === 'width' || name === 'height' || name === 'radius' || name === 'radius2' || name === 'angle')) {

            if (value === 'm' || (name === 'win' && newParams.unit === 'm')) {
                newParams.width = 1000
                newParams.height = 2000
                newParams.radius = 1000
                newParams.radius2 = 1000
            }
            else if (value === 'km' || (name === 'win' && newParams.unit === 'km')) {
                newParams.width = 1
                newParams.height = 2
                newParams.radius = 1
                newParams.radius2 = 1
            }

            const multiplier = {
                m: 1,
                km: 1e3
            }[newParams.unit];

            if (newParams.win === 'rectangle' && newParams.width && newParams.height) {
                const width = +newParams.width * multiplier;
                const height = +newParams.height * multiplier;
                const coordinates = getRectangularCoordinates(Number(newParams.longitude), Number(newParams.latitude), width, height);
                newParams.geojson = JSON.stringify({ type: 'Polygon', coordinates: [coordinates] });

                newParams.x_case = [(getTargetCoordinates(newParams.longitude, newParams.latitude, 90, width / 2)[0]).toFixed(4)];
                newParams.y_case = [(getTargetCoordinates(newParams.longitude, newParams.latitude, 0, height / 2)[1]).toFixed(4)];

                newParams.x_control = [(getTargetCoordinates(newParams.longitude, newParams.latitude, 90, width / 2)[0]).toFixed(4)];
                newParams.y_control = [(getTargetCoordinates(newParams.longitude, newParams.latitude, 0, height / 2)[1]).toFixed(4)];

                //Parameters are in the unit selected, converted to meters on submit
                newParams.r_case = [(Math.floor(Math.min(newParams.width / 2, newParams.height / 2) * 10) / 10)];
                newParams.s_case = [(Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10)];

                newParams.s_control = [Math.floor(Math.min(newParams.width / 3, newParams.height / 3) * 10) / 10]
            }
            /*
            else if (newParams.win === 'circle' && newParams.radius) {
                const radius = +newParams.radius * multiplier;
                const coordinates = getRegularPolygonalCoordinates(newParams.longitude, newParams.latitude, radius);
                newParams.geojson = JSON.stringify({ type: 'Polygon', coordinates: [coordinates] });

                newParams.x_case = [newParams.longitude];
                newParams.y_case = [newParams.latitude];

                newParams.x_control = [newParams.longitude];
                newParams.y_control = [newParams.latitude];

                //Parameters are in the unit selected, converted to meters on submit
                newParams.r_case = [Math.floor((newParams.radius / 2) * 10) / 10];
                newParams.s_case = [Math.floor((newParams.radius / 3) * 10) / 10];

                newParams.s_control = [Math.floor((newParams.radius / 3) * 10) / 10]
            }*/
            else if ((newParams.win === 'ellipse' && newParams.radius && newParams.radius2) || name === 'angle') {
                const radius = +newParams.radius * multiplier;
                const radius2 = +newParams.radius2 * multiplier;

                const coordinates = getEllipticalCoordinates(newParams.longitude, newParams.latitude, radius, radius2, newParams.angle);
                newParams.geojson = JSON.stringify({ type: 'Polygon', coordinates: [coordinates] });

                newParams.x_case = [newParams.longitude];
                newParams.y_case = [newParams.latitude];

                newParams.x_control = [newParams.longitude];
                newParams.y_control = [newParams.latitude];

                newParams.r_case = [Math.floor(Math.min(newParams.radius / 2, newParams.radius2 / 2) * 10) / 10];
                newParams.s_case = [Math.floor(Math.min(newParams.radius / 3, newParams.radius2 / 3) * 10) / 10];

                newParams.s_control = [Math.floor(Math.min(newParams.radius / 3, newParams.radius2 / 3) * 10) / 10];
            } else if (newParams.win != 'custom') {
                newParams.geojson = '';
            }

        }

        mergeParams(newParams);
    }

    function handleBlur(event) {
        const { name, value, dataset } = event.target;
        const newParams = { ...params, [name]: value };

        if (dataset.type === 'number-array')
            newParams[name] = value.split(/[\s,]+/g).map(Number).filter(n => !isNaN(n));
        else if (dataset.type === 'number')
            newParams[name] = Number(value)

        mergeParams(newParams);
    }



    function handleSubmit(event) {
        event.preventDefault();

        if (onSubmit) {
            onSubmit(params);
            if (!params.queue)
                setSubmitted(true);
        }
    }

    function handleReset(event) {
        event.preventDefault();
        resetParams();
        if (onReset) {
            onReset(getInitialState());
        }
    }

    return <form className={className} onSubmit={handleSubmit} onReset={handleReset}>
        <fieldset className="border px-3 mb-4">
            <legend className="legend font-weight-bold">Spatial Window</legend>
            <div className="row">
                <div className="col-18 form-group">
                    <label htmlFor="win" className="required">Window Shape</label>
                    <OverlayTrigger overlay={<Tooltip id="win_tooltip">Specify the shape of the window</Tooltip>}>
                        <select
                            id="win"
                            name="win"
                            className="custom-select"
                            value={params.win}
                            onChange={handleChange}>
                            <option value="" hidden>(select option)</option>
                            {!params.gis && <option value="unit_circle">Unit Circle</option>}
                            {!params.gis && <option value="unit_square">Unit Square</option>}
                            <option value="rectangle">Rectangle</option>
                            <option value="ellipse">Ellipse</option>
                            {params.gis && <option value="custom">Custom Window</option>}
                        </select>
                    </OverlayTrigger>
                </div>

                <div className="col-6 pt-3 pt-1-xs form-group custom-control custom-checkbox">
                    <div className="d-block">&nbsp;</div>
                    <input
                        type="checkbox"
                        className="custom-control-input"
                        id="gis"
                        name="gis"
                        checked={params.gis}
                        onChange={handleChange} />

                    <OverlayTrigger overlay={<Tooltip id="gis_tooltip">If checked, display 4th plot with map and plot overlays</Tooltip>}>
                        <label className="custom-control-label" htmlFor="gis">GIS</label>
                    </OverlayTrigger>
                </div>
            </div>

            {params.win === 'custom' && <div className="col-md-24 pl-0">
                <label htmlFor="customFile">GeoJSON File</label>
            </div>}

            {params.win === 'custom' && <div className="col-md-24">
                <label class="custom-file-label" for="customFile">{params.filename ? params.filename : 'Choose a geoJSON file'}</label>
                <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Choose a geoJSON file with a custom polygon. No validation will be provided for custom windows.</Tooltip>}>
                    <input
                        type="file"
                        id="customFile"
                        name="customFile"
                        step="any"
                        label="Choose a geoJSON file"
                        className="custom-file-input form-control"
                        value={params.customFile}
                        onChange={e => {
                            handleUpload(e.target.files[0])
                        }} />
                </OverlayTrigger>

            </div>}

            {params.win === 'custom' && <div className='row'>
                <Button
                    variant="link"
                    className='col-md-12 form-group pt-0'
                    onClick={handleLoadFile}
                    style={{textAlign:'left'}}
                >
                    <i className="fa fa-file mr-1"></i>
                    Load geoJSON
                </Button>

                <a
                    className='col-md-12 form-group'
                    href="assets/files/Washington_DC_Boundary.geojson"
                    target="_blank"
                    download
                    style={{textAlign:'right'}}
                >
                    <i className="fa fa-file mr-1"></i>
                    Download geoJSON
                </a>
            </div>}

            {fileError && <div className="col-md-24 form-group pl-0">
                <span style={{ color: 'red' }}>{fileError}</span>
            </div>}

            {params.gis && <div className="form-group">
                <label htmlFor="unit" className="required">Unit</label>
                <OverlayTrigger overlay={<Tooltip id="win_tooltip">Specify the unit of measurement for the window</Tooltip>}>
                    <select
                        id="unit"
                        name="unit"
                        className="custom-select"
                        value={params.unit}
                        onChange={handleChange}>
                        <option value="" hidden>(select option)</option>
                        <option value="km">Kilometers</option>
                        <option value="m">Meters</option>
                    </select>
                </OverlayTrigger>
            </div>}

            {params.win === "rectangle" && <>
                {!params.gis && <div className="row">
                    <div className="col-md-12 form-group">
                        <label htmlFor="x_origin">X Origin</label>
                        <OverlayTrigger overlay={<Tooltip id="x_origin_tooltip">Enter the X coordinate of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="x_origin"
                                name="x_origin"
                                step="any"
                                className="form-control"
                                value={params.x_origin}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-12 form-group">
                        <label htmlFor="y_origin">Y Origin</label>
                        <OverlayTrigger overlay={<Tooltip id="y_origin_tooltip">Enter the Y coordinate of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="y_origin"
                                name="y_origin"
                                step="any"
                                className="form-control"
                                value={params.y_origin}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>
                </div>}

                {params.gis && <div className="row">
                    <div className="col-md-12 form-group">
                        <label htmlFor="longitude">Longitude</label>
                        <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the longitude of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="longitude"
                                name="longitude"
                                step="any"
                                className="form-control"
                                value={params.longitude}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-12 form-group">
                        <label htmlFor="latitude">Latitude</label>
                        <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the latitude of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="latitude"
                                name="latitude"
                                step="any"
                                className="form-control"
                                value={params.latitude}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>
                </div>}

                <div className="row">
                    <div className="col-md-12 form-group">
                        <label htmlFor="width">Width {params.gis && params.unit && `(${params.unit})`}</label>
                        <OverlayTrigger overlay={<Tooltip id="width_tooltip">Enter the width of the rectangular area</Tooltip>}>
                            <input
                                type="number"
                                id="width"
                                name="width"
                                step="any"
                                min="0"
                                className="form-control"
                                value={params.width}
                                onChange={handleChange} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-12 form-group">
                        <label htmlFor="height">Height {params.gis && params.unit && `(${params.unit})`}</label>
                        <OverlayTrigger overlay={<Tooltip id="height_tooltip">Enter the height of the rectangular area</Tooltip>}>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                step="any"
                                min="0"
                                className="form-control"
                                value={params.height}
                                onChange={handleChange} />
                        </OverlayTrigger>
                    </div>
                </div>
            </>}

            {/*params.win === "circle" && <div className="row">
                {!params.gis && <div className="col-md-8 form-group">
                    <label htmlFor="x_origin">X Origin</label>
                    <OverlayTrigger overlay={<Tooltip id="x_origin_tooltip">Enter the X coordinate of the center of the circle</Tooltip>}>
                        <input
                            type="text"
                            data-type="number"
                            id="x_origin"
                            name="x_origin"
                            step="any"
                            className="form-control"
                            value={params.x_origin}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </OverlayTrigger>
                </div>}

                {!params.gis && <div className="col-md-8 form-group">
                    <label htmlFor="y_origin">Y Origin</label>
                    <OverlayTrigger overlay={<Tooltip id="y_origin_tooltip">Enter the Y coordinate of the center of the circle</Tooltip>}>
                        <input
                            type="text"
                            data-type="number"
                            id="y_origin"
                            name="y_origin"
                            step="any"
                            className="form-control"
                            value={params.y_origin}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </OverlayTrigger>
                </div>}

                {params.gis && <div className="col-md-8 form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the latitude of the lower left corner</Tooltip>}>
                        <input
                            type="text"
                            data-type="number"
                            id="latitude"
                            name="latitude"
                            step="any"
                            className="form-control"
                            value={params.latitude}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </OverlayTrigger>
                </div>}

                {params.gis && <div className="col-md-8 form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the longitude of the lower left corner</Tooltip>}>
                        <input
                            type="text"
                            data-type="number"
                            id="longitude"
                            name="longitude"
                            step="any"
                            className="form-control"
                            value={params.longitude}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                    </OverlayTrigger>
                </div>}

                <div className="col-md-8 form-group">
                    <label htmlFor="radius">Radius {params.gis && params.unit && `(${params.unit})`}</label>
                    <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Enter the radius of the circle</Tooltip>}>
                        <input
                            type="number"
                            id="radius"
                            name="radius"
                            step="any"
                            min="0"
                            className="form-control"
                            value={params.radius}
                            onChange={handleChange} />
                    </OverlayTrigger>
                </div>
            </div>*/}

            {params.win === "ellipse" && <>
                {!params.gis && <div className="row">
                    <div className="col-md-12 form-group">
                        <label htmlFor="x_origin">X Origin</label>
                        <OverlayTrigger overlay={<Tooltip id="x_origin_tooltip">Enter the X coordinate of the center of the ellipse</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="x_origin"
                                name="x_origin"
                                step="any"
                                className="form-control"
                                value={params.x_origin}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-12 form-group">
                        <label htmlFor="y_origin">Y Origin</label>
                        <OverlayTrigger overlay={<Tooltip id="y_origin_tooltip">Enter the Y coordinate of the center of the ellipse</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="y_origin"
                                name="y_origin"
                                step="any"
                                className="form-control"
                                value={params.y_origin}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>
                </div>}
                {params.gis && <div className="row">
                    <div className="col-md-12 form-group">
                        <label htmlFor="latitude">Latitude</label>
                        <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the latitude of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="latitude"
                                name="latitude"
                                step="any"
                                className="form-control"
                                value={params.latitude}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-12 form-group">
                        <label htmlFor="longitude">Longitude</label>
                        <OverlayTrigger overlay={<Tooltip id="latitude_tooltip">Enter the longitude of the lower left corner</Tooltip>}>
                            <input
                                type="text"
                                data-type="number"
                                id="longitude"
                                name="longitude"
                                step="any"
                                className="form-control"
                                value={params.longitude}
                                onChange={handleChange}
                                onBlur={handleBlur} />
                        </OverlayTrigger>
                    </div>
                </div>}

                <div className="row">
                    <div className="col-md-8 form-group">
                        <label htmlFor="radius">Radius 1 {params.gis && params.unit && `(${params.unit})`}</label>
                        <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Enter the first radius of the ellipse</Tooltip>}>
                            <input
                                type="number"
                                id="radius"
                                name="radius"
                                step="any"
                                min="0"
                                className="form-control"
                                value={params.radius}
                                onChange={handleChange} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-8 form-group">
                        <label htmlFor="radius2">Radius 2 {params.gis && params.unit && `(${params.unit})`}</label>
                        <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Enter the second radius of the ellipse</Tooltip>}>
                            <input
                                type="number"
                                id="radius2"
                                name="radius2"
                                step="any"
                                min="0"
                                className="form-control"
                                value={params.radius2}
                                onChange={handleChange} />
                        </OverlayTrigger>
                    </div>

                    <div className="col-md-8 form-group">
                        <label htmlFor="angle">Angle (degrees)</label>
                        <OverlayTrigger overlay={<Tooltip id="radius_tooltip">Enter the angle of the ellipse</Tooltip>}>
                            <input
                                type="number"
                                id="angle"
                                name="angle"
                                step="any"
                                className="form-control"
                                value={params.angle}
                                onChange={handleChange} />
                        </OverlayTrigger>
                    </div>
                </div>
            </>}

        </fieldset>

        <fieldset className="border px-3 mb-4">
            <legend className="legend font-weight-bold">Sample Case</legend>
            <div className="form-group">
                <label htmlFor="samp_case" className="required">Case Type</label>
                <OverlayTrigger overlay={<Tooltip id="samp_case_tooltip">Specify how case locations are randomized.</Tooltip>}>
                    <select
                        id="samp_case"
                        name="samp_case"
                        className="custom-select"
                        value={params.samp_case}
                        onChange={handleChange}>
                        <option value="" hidden>(select option)</option>
                        <option value="uniform">Uniform</option>
                        <option value="MVN">Multivariate Normal (MVN)</option>
                        <option value="CSR">Complete Spatial Randomness (CSR)</option>
                    </select>
                </OverlayTrigger>
            </div>

            {params.samp_case && <div className="form-group">
                <label htmlFor="x_case" className="required">X coordinate(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="x_case_tooltip">Specify x-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="x_case"
                        name="x_case"
                        className="form-control"
                        aria-describedby="x_case_tooltip"
                        value={params.x_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case && <div className="form-group">
                <label htmlFor="y_case" className="required">Y coordinate(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="y_case_tooltip">Specify y-coordinate(s) of case cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="y_case"
                        name="y_case"
                        className="form-control"
                        value={params.y_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case && params.samp_case !== 'MVN' && <div className="form-group">
                <label htmlFor="r_case" className=" required">Radius (radii) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="r_case_tooltip">Optional. Specify the radius (radii) of case cluster(s) in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="r_case"
                        name="r_case"
                        className="form-control"
                        value={params.r_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_case === 'MVN' && <div className="form-group">
                <label htmlFor="s_case" className="required">Standard deviation(s) of case cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="s_case_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for case locations in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="s_case"
                        name="s_case"
                        className="form-control"
                        value={params.s_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
            {params.samp_case && <div className="form-group">
                <label htmlFor="n_case" className="required">N Case</label>
                <OverlayTrigger overlay={<Tooltip id="n_case_tooltip">Specify the sample size for case locations in each cluster as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        id="n_case"
                        name="n_case"
                        className="form-control"
                        value={params.n_case}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <fieldset className="border px-3 mb-4">
            <legend className="legend font-weight-bold">Sample Control</legend>
            <div className="form-group">
                <label htmlFor="samp_control" className="required">Control Type</label>
                <OverlayTrigger overlay={<Tooltip id="samp_control_tooltip">Specify how control locations are randomized.</Tooltip>}>
                    <select
                        id="samp_control"
                        name="samp_control"
                        className="custom-select"
                        value={params.samp_control}
                        onChange={handleChange}>
                        <option value="" hidden>(select option)</option>
                        <option value="uniform">Uniform</option>
                        <option value="systematic">Systematic</option>
                        <option value="MVN">Multivariate Normal (MVN)</option>
                        <option value="CSR">Complete Spatial Randomness (CSR)</option>
                    </select>
                </OverlayTrigger>
            </div>

            {params.samp_control && params.samp_control === 'MVN' && <div className="form-group">
                <label htmlFor="x_control" className="required">X coordinate(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="x_control_tooltip">Specify x-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="x_control"
                        name="x_control"
                        className="form-control"
                        value={params.x_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_control && params.samp_control === 'MVN' && <div className="form-group">
                <label htmlFor="y_control" className="required">Y coordinate(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="y_control_tooltip">Specify y-coordinate(s) of control cluster(s) as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="y_control"
                        name="y_control"
                        className="form-control"
                        value={params.y_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}

            {params.samp_control === 'MVN' && <div className="form-group">
                <label htmlFor="s_control" className="required">Standard deviation(s) of control cluster(s)</label>
                <OverlayTrigger overlay={<Tooltip id="s_control_tooltip">Optional. Specify the standard deviation(s) of the multivariate normal distribution for control locations in the units of win as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        step="any"
                        id="s_control"
                        name="s_control"
                        className="form-control"
                        value={params.s_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
            {params.samp_control && <div className="form-group">
                <label htmlFor="n_control" className="required">N Control</label>
                <OverlayTrigger overlay={<Tooltip id="n_control_tooltip">Specify the sample size for control locations in each cluster as a numeric value or vector.</Tooltip>}>
                    <input
                        type="text"
                        data-type="number-array"
                        id="n_control"
                        name="n_control"
                        className="form-control"
                        value={params.n_control}
                        onChange={handleChange}
                        onBlur={handleBlur} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <div className="form-group">
            <label htmlFor="sim_total" className="required">Number of Simulations</label>
            <OverlayTrigger overlay={<Tooltip id="sim_total_tooltip">Specify the number of simulation iterations to perform.</Tooltip>}>
                <input
                    type="number"
                    min="0"
                    id="sim_total"
                    name="sim_total"
                    className="form-control"
                    value={params.sim_total}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="rand_seed" className="required">Random Seed</label>
            <OverlayTrigger overlay={<Tooltip id="rand_seed_tooltip">Specify a random seed</Tooltip>}>
                <input
                    type="number"
                    id="rand_seed"
                    name="rand_seed"
                    min="0"
                    className="form-control no-spinner"
                    value={params.rand_seed}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="form-group">
            <label htmlFor="alpha" className="required">Alpha</label>
            <OverlayTrigger overlay={<Tooltip id="alpha_tooltip">Specify a numeric value to calculate p-value thresholds (default=0.05).</Tooltip>}>
                <input
                    type="number"
                    min="0"
                    max="1"
                    step="any"
                    id="alpha"
                    name="alpha"
                    className="form-control no-spinner"
                    value={params.alpha}
                    onChange={handleChange} />
            </OverlayTrigger>
        </div>

        <div className="custom-control custom-checkbox">
            <input
                type="checkbox"
                className="custom-control-input"
                id="multi_test"
                name="multi_test"
                checked={params.multi_test}
                onChange={handleChange} />

            <OverlayTrigger overlay={<Tooltip id="multi_test_tooltip">If checked, enable the selection of multiple testing correction.</Tooltip>}>
                <label className="custom-control-label" htmlFor="multi_test">Multiple Testing Correction</label>
            </OverlayTrigger>
        </div>

        {params.multi_test && <div className="form-group">
            <OverlayTrigger overlay={<Tooltip id="win_tooltip">Specify the type of multiple testing correction.</Tooltip>}>
                <select
                    id="p_correct"
                    name="p_correct"
                    className="custom-select"
                    value={params.p_correct}
                    onChange={handleChange}>
                    <option value="" hidden>(select option)</option>
                    <option value="none">None</option>
                    <option value="FDR">False Discovery Rate</option>
                    <option value="Sidak">Sidak</option>
                    <option value="Bonferroni">Bonferroni</option>
                </select>
            </OverlayTrigger>
        </div>}

        <hr className="mt-4" />

        <fieldset className="border px-3 mb-4">
            <legend className="legend font-weight-bold">Queue</legend>
            <div className="form-group custom-control custom-checkbox">
                <input
                    type="checkbox"
                    className="custom-control-input"
                    id="queue"
                    name="queue"
                    checked={params.queue}
                    onChange={handleChange}
                    readOnly={params.sim_total > simQueueCutoff} />

                <OverlayTrigger overlay={<Tooltip id="queue_tooltip">If checked, submit this job to a processing queue and receive results via email. This option will always be selected if more than {simQueueCutoff} simulations will be run.</Tooltip>}>
                    <label className="custom-control-label" htmlFor="queue">Submit Job to Queue</label>
                </OverlayTrigger>
            </div>

            {params.queue && <div className="form-group">
                <label
                    htmlFor="job_name"
                    className=" required">
                    Job Name
            </label>
                <OverlayTrigger overlay={<Tooltip id="job_name_tooltip">Enter a name for the job.</Tooltip>}>
                    <input
                        type="text"
                        id="job_name"
                        name="job_name"
                        className="form-control"
                        value={params.job_name}
                        disabled={!params.queue}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>}

            {params.queue && <div className="form-group">
                <label
                    htmlFor="email"
                    className=" required">
                    Email
            </label>
                <OverlayTrigger overlay={<Tooltip id="email_tooltip">Results will be sent to the specified email.</Tooltip>}>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={params.email}
                        disabled={!params.queue}
                        onChange={handleChange} />
                </OverlayTrigger>
            </div>}
        </fieldset>

        <div className="text-right">
            <button type="reset" className="btn btn-outline-danger mx-1">
                Reset
            </button>

            <button type="submit" className="btn btn-primary" disabled={!checkRequired() || submitted}>
                Submit
            </button>
        </div>
    </form>
}