import React from 'react';
import { NavLink } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import CardDeck from 'react-bootstrap/CardDeck'
import { Link } from 'react-router-dom';

export function Home({links}) {

    function cardRow(links){
        return(
            <CardDeck>
                {links.map(
                    (
                        {exact, route, title, cardTitle, cardText}, index
                    ) => (
                        <>
                            <Card
                                key={title}
                                className="mb-5 align-self-center"
                                text='left'
    
                                style={{
                                width: '20rem',
                                height: '15rem',
                                border: '1px solid #DADBE6',
                                backgroundColor: 'white',
                                }}
                            >
                                <Card.Header
                                    style={{
                                        backgroundColor:'#113b82',
                                        color:'white',
                                        textAlign:'left'
                                    }}
                                >
                                    <b>{cardTitle}</b>
                                </Card.Header>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Text>
                                        {cardText}
                                    </Card.Text>
                                    <a href="#" class="btn btn-primary align-self-start mt-auto">Action</a>
                                </Card.Body>
                                
                            </Card>
                        </>
                    )
                )}
            </CardDeck>
        )
    }

    return <div>
        <div className="jumbotron jumbotron-fluid text-light bg-primary-darker">
            <div className="container">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid white' }}>SparrpowR Web Tool</span>
                </h1>
                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-light" to="calculate">Perform Analysis</NavLink>
            </div>
            
        </div>
        <div className="container align-middle text-center" style={{ marginTop: '70px' }}>
            {cardRow(links.slice(0,3))}
        </div>

        <div className="container mb-5">
            <div className="row">
                <div className="col-md mb-4">
                    <div className="card shadow h-100">
                        <h2 className="h5 card-header bg-primary text-white">
                            Feature 1
                        </h2>

                        <div className="card-body">
                            <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a urna non ligula molestie lacinia. Quisque fermentum quam porttitor, scelerisque orci sit amet, ornare lacus. </p>
                        </div>

                        <div className="card-footer bg-white border-0">
                            <a href="#" className="btn btn-primary">Action</a>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-4">
                    <div className="card shadow h-100">
                        <h2 className="h5 card-header bg-primary text-white">
                            Feature 2
                        </h2>

                        <div className="card-body">
                            <p className="card-text">Ut hendrerit augue id enim malesuada tincidunt. Quisque fermentum convallis mi, vel placerat sem tempor at. Maecenas pulvinar in ligula ultrices elementum. Sed sed enim vestibulum, convallis eros ut, mattis enim. </p>
                        </div>

                        <div className="card-footer bg-white border-0">
                            <a href="#" className="btn btn-primary">Action</a>
                        </div>
                    </div>
                </div>

                <div className="col-md mb-4">
                    <div className="card shadow h-100">
                        <h2 className="h5 card-header bg-primary text-white">
                            Feature 3
                        </h2>

                        <div className="card-body">
                            <p className="card-text">Integer luctus ex mauris, eget feugiat est accumsan sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et ex sed massa accumsan ultricies in nec sem. Donec lacinia purus diam, nec semper magna bibendum a. </p>
                        </div>

                        <div className="card-footer bg-white border-0">
                            <a href="#" className="btn btn-primary">Action</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}
