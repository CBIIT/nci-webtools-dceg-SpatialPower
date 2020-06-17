import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Navbar } from './components/navbar/navbar';
import { Home } from './pages/home/home';
import { Calculate } from './pages/calculate/calculate';
import { About } from './pages/about/about';
import './styles/main.scss';

export function App() {

  const links = [
    {
      route: '/',
      title: 'Home',
    },
    {
      route: '/calculate',
      title: 'Calculate',
    },
    {
      route: '/about',
      title: 'About',
    },
  ];

  return (
    <Router>
      <Header 
        imageSource="assets/images/dceg-logo.svg" 
        url="https://dceg.cancer.gov/"
      />    
      <Navbar links={links} />
      <Route path="/" exact={true} component={Home} />
      <Route path="/calculate" component={Calculate} />
      <Route path="/about" component={About} />
      <Footer 
        style={{background: 'linear-gradient(45deg,#006789,#54beb9)'}}
        title={<>
            <div className="h4 mb-0">Division of Cancer Epidemiology and Genetics</div>
            <div className="h6">at the National Cancer Institute</div>
        </>}
      />
      
    </Router>
  );
}
