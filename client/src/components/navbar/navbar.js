import React from 'react';
import { Navbar as BoostrapNavbar, Nav } from 'react-bootstrap';
import { NavLink } from "react-router-dom";

export function Navbar({ className, links }) {
    return <BoostrapNavbar variant="dark" className="bg-primary py-0">
        <div className="container">
            <Nav className="mr-auto">
                {links.map((link, i) =>
                    <NavLink
                        key={`navlink-${i}`}
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
}
