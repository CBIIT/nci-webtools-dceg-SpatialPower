import React, { useEffect } from 'react';
import { Route, useLocation, NavLink } from 'react-router-dom';
import { Navbar, NCIHeader, NCIFooter } from '@cbiitss/react-components'
import { Home } from './pages/home/home';
import { Calculate } from './pages/calculate/calculate';
import { About } from './pages/about/about';
import './styles/main.scss';

export function App() {
  const { pathname } = useLocation();
  useEffect(_ => window.scrollTo(0, 0), [pathname]);

  const links = [
    {
      route: '/',
      title: 'Home',
    },
    {
      route: '/SparrpowR',
      title: 'SparrpowR',
    },
    {
      route: '/about',
      title: 'About',
    },
  ];

  return (
    <>
      <NCIHeader 
        imageSource="assets/images/dceg-logo.svg" 
        url="https://dceg.cancer.gov/"
      />    
      <Navbar 
        className="py-0 shadow-sm"
        bg="dark"
        innerClassName="container"
        links={links}
        renderer={link => 
          <NavLink
              key={`navlink-${link.index}`}
              exact
              activeClassName="active"
              className="nav-link px-3 text-uppercase font-weight-bold"
              to={link.route}>
              {link.title}
          </NavLink>}
      />
      <Route path="/" exact={true} component={Home} />
      <Route path="/SparrpowR/:id?" component={Calculate} />
      <Route path="/about" component={About} />
      <NCIFooter 
        className="py-4 bg-primary-gradient text-light"
        title={<div className="mb-4">
            <div className="h4 mb-0">Division of Cancer Epidemiology and Genetics</div>
            <div className="h6">at the National Cancer Institute</div>
        </div>}
      />
    </>
  );
}
