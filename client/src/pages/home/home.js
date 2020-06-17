import React from 'react';
import { NavLink } from 'react-router-dom'

export function Home() {
    return <div>
        <div className="jumbotron jumbotron-fluid text-light mb-0" style={{backgroundColor: '#122E51'}}>
            <div className="container">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{borderBottom: '2px solid white'}}>SparrpowR Web Tool</span>
                </h1>
                <p className="lead">Estimate statistical power of spatial clusters</p>
                <NavLink className="btn btn-lg btn-outline-light" to="calculate">Perform Analysis</NavLink>
            </div>
        </div>
    </div>
}