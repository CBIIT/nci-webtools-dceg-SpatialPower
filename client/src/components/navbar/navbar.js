import React from 'react';
import { Navbar as BoostrapNavbar, Nav } from 'react-bootstrap';
import { NavLink } from "react-router-dom";

export function Navbar({ links }) {
    return <div>
        <BoostrapNavbar variant="dark" className="py-0" style={{backgroundColor: '#185394'}}>
            <div class="container">
                <Nav className="mr-auto">
                    {links.map(link =>
                        <NavLink
                            exact
                            activeClassName="active"
                            className="nav-link text-white px-3 text-uppercase"
                            to={link.route} >
                            {link.title}
                        </NavLink>
                    )}
                </Nav>
            </div>
        </BoostrapNavbar>
    </div>
}