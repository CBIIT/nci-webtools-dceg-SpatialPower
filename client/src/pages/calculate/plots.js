import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { useSelector } from 'react-redux';

export function Plots() {
    let { id, plots, urlKey } = useSelector(state => state.results);
    if (!plots) return null;
    if (!Array.isArray(plots)) plots = [plots];

    const plotNames = [
        'Simulated Data (First Iteration)',
        'Local Power (Continuous Scale)',
        'Local Power (Above Threshold)'
    ];

    return <Tab.Container id="plots-container" defaultActiveKey="plot-0">
        <Card className="shadow-sm mb-3">
            <Card.Header className="bg-white">
                <Nav variant="tabs">
                    {plots.map((plot, i) => <Nav.Item>
                        <Nav.Link eventKey={`plot-${i}`} style={{fontWeight: 'bold'}}>{plotNames[i]}</Nav.Link>
                    </Nav.Item>)}
                </Nav>
            </Card.Header>
            <Card.Body>
                <Tab.Content className="text-center">
                    {plots.map((plot, i) => <Tab.Pane eventKey={`plot-${i}`}>
                        <img className="img-fluid" src={`results/${id}/${plot}?key=${urlKey}`} alt={`Plot ${i + 1}`} />
                    </Tab.Pane>)}
                </Tab.Content>
            </Card.Body>
        </Card>
    </Tab.Container>
}