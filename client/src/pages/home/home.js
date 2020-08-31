import React from 'react';
import { NavLink } from 'react-router-dom'
// import Card from 'react-bootstrap/Card'
import './home.css';

export function Home() {

    /*const cards = [
        {
            title: 'Spatial Power',
            body: 'Compute the statistical power of a spatial relative risk function using randomly generated data.',
            action: {
                route: 'calculate',
                text: 'Run Estimate',
            }
        },
    ];*/

    return <>
        <div className="jumbotron jumbotron-fluid text-dark ">
            <div className="container text-center" style={{zIndex: 1}}>
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid #343a40' }}>Spatial Power Web Tool</span>
                </h1>

                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-dark" to="sparrpowR">Run Calculation</NavLink>
            </div>
        </div>
        <div className="container lead mb-4">
            <p>
                The Spatial Power Web Tool serves as a frontend interface for the <a className="font-weight-bold" href="https://cran.r-project.org/web/packages/sparrpowR/index.html">sparrpowR package</a>. The webtool has the same functionality as the package, but allows users to easily input their study parameters into an online form instead of interacting directly with R.
            </p>

            <p>
                The web tool displays the calculated power in tabular form as well as graphically, with the same graphics directly produced by the R package. Users are  able to download their power results and visualizations directly from the webtool for implementation in presentations, grant applications, or even publications.
            </p>
        </div>
        {/*
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
        </div>*/}
    </>
}
