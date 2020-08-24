import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { useSelector } from 'react-redux';

export function Plots({ onExport = e => { } }) {
    let { id, plots, urlKey } = useSelector(state => state.results);
    const params = useSelector(state => state.params);
    if (!plots) return null;
    if (!Array.isArray(plots)) plots = [plots];

    function handleExport(event) {
        event.preventDefault();
        if (onExport) {
            onExport(params);
        }
        return false;
    }

    const plotNames = [
        'Simulated Data (First Iteration)',
        'Local Power (Continuous Scale)',
        'Local Power (Above Threshold)'
    ];

    return <Tab.Container id="plots-container" defaultActiveKey="plot-0">
        <Card className="shadow-sm mb-3">
            <Card.Header className="bg-white">
                <div className="d-flex">
                    <Nav variant="tabs">
                        {plots.map((plot, i) => <Nav.Item key={`plot-tab-${i}`}>
                            <Nav.Link eventKey={`plot-${i}`} className="font-weight-bold">{plotNames[i]}</Nav.Link>
                        </Nav.Item>)}
                    </Nav>
                    <button
                        id="export"
                        className="btn btn-outline-primary ml-auto"
                        onClick={handleExport}>
                        Export
                    </button>
                </div>
            </Card.Header>
            <Card.Body>
                <Tab.Content className="text-center">
                    {plots.map((plot, i) => <Tab.Pane key={`plot-tab-container-${i}`} eventKey={`plot-${i}`}>
                        <img className="img-fluid" src={`api/results/${id}/${plot}?key=${urlKey}`} alt={`Plot ${i + 1}`} />
                    </Tab.Pane>)}
                </Tab.Content>
            </Card.Body>
        </Card>
    </Tab.Container>
}