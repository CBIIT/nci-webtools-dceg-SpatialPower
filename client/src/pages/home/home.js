import React from 'react';
import { NavLink } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import './home.css';

export function Home() {

    const cards = [
        {
            title: 'Spatial Power',
            body: 'Compute the statistical power of a spatial relative risk function using randomly generated data.',
            action: {
                route: 'calculate',
                text: 'Run Estimate',
            }
        },
        {
            title: 'Feature 2',
            body: 'Description for Feature 2',
            action: {
                route: 'calculate',
                text: 'Action',
            }
        },
        {
            title: 'Feature 3',
            body: 'Description for Feature 3',
            action: {
                route: 'calculate',
                text: 'Action',
            }
        }
    ];

    return <>
        <div className="jumbotron jumbotron-fluid text-light bg-primary-darker">
            <div className="container text-center">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid white' }}>SparrpowR Web Tool</span>
                </h1>

                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-light" to="calculate">Run Estimate</NavLink>
            </div>
        </div>

        <div className="container mb-5">
            <div className="row">
                {cards.map(({title, body, action}, i) => 
                    <div className="col-lg-4 mb-4" key={`home-card-${i}`}>
                        <Card className="shadow h-100">
                            <Card.Header className="h5 bg-primary text-white">
                                {title}
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    {body}
                                </Card.Text>
                            </Card.Body>

                            <Card.Footer className="bg-white border-0">
                                <NavLink
                                    className="btn btn-primary btn-block"
                                    to={action.route}>
                                    {action.text}
                                </NavLink>
                            </Card.Footer>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    </>
}
