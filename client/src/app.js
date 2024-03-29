import React, { useEffect } from 'react';
import { Route, useLocation, NavLink } from 'react-router-dom';
import { Navbar, NCIHeader } from '@cbiitss/react-components'
import { Home } from './pages/home/home';
import { Calculate } from './pages/calculate/calculate';
import { About } from './pages/about/about';
import { Citations } from './pages/citations/citations'
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
      route: '/sparrpowR',
      title: 'SparrpowR',
    },
    {
      route: '/citations',
      title: 'Citations'
    },
    {
      route: '/about',
      title: 'About',
    }
  ];

  return (
    <div style={{backgroundColor: '#F1F1F1'}}>
      <NCIHeader 
        imageSource="assets/images/dceg-logo.svg" 
        url="https://dceg.cancer.gov/"
        style={{backgroundColor: 'white'}}
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
      <main id="main">
        <Route path="/" exact={true} component={Home} />
        <Route path="/sparrpowR/:id?" component={Calculate} />
        <Route path="/citations" component={Citations} />
        <Route path="/about" component={About} />
      </main>
    </div>
  );
}
