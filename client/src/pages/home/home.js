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
        <div className="jumbotron jumbotron-fluid text-light ">
            <div className="banner-text container text-center">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid white' }}>Spatial Power</span>
                </h1>

                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-light" to="sparrpowR">Run Calculation</NavLink>
            </div>
        </div>
        <div className="container lead mb-4">
            <p>
            Spatial Power is a suite of web-based applications designed to easily and efficiently perform power calculations for select spatial statistics. Each included application is specialized for a specific statistic. Spatial data are randomly generated using study-specific parameters and a statistic is calculated iteratively to assess statistical power. The applications provide graphical presentations of both simulated data and power -- including a Geographic Information System overlay.
            </p>
            <h4 style={{marginTop:'2.5rem'}}>Credits</h4>
            <p>
                Spatial Power was developed by <a href='https://dceg.cancer.gov/fellowship-training/what-our-fellows-do/meet-current-fellows/oeeb-fellows#ian-buller-phd-ma-postdoctoral-fellow'>Ian Buller</a> and <a href='https://dceg.cancer.gov/fellowship-training/what-our-fellows-do/meet-current-fellows/iteb-fellows#derek-brown-phd-postdoctoral-fellow'>Derek Brown</a> in collaboration with NCI's Center for Biomedical Informatics and Information Technology (CBIIT).
                Support comes from the <a href='https://dceg.cancer.gov/'>Division of Cancer Epidemiology and Genetics</a> Informatics Tool Challenge.
            </p>
            <p>
                Questions or comments? Contact us via <a href='mailto:NCISpatialPowerWebAdmin@nih.gov?subject=Spatial Power'>email.</a>
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
