import React from 'react';
import { NavLink } from 'react-router-dom'
import Card from 'react-bootstrap/Card'

export function Home() {

    const cards = [
        {
            title: 'Feature 1',
            body: 'Description for Feature 1',
            action: {
                route: 'action',
                text: 'Action',
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
                route: 'about',
                text: 'Action',
            }
        }
    ];

    return <>
        <div className="jumbotron jumbotron-fluid text-light bg-primary-darker">
            <div className="container">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid white' }}>SparrpowR Web Tool</span>
                </h1>
                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-light" to="calculate">Perform Analysis</NavLink>
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
