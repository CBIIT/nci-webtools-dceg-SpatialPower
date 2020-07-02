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

  const cardLinks = [
    {
      action:'Feature 1',
      title:'Feature 1',
      cardTitle:'Feature 1',
      cardText:'Perform Feature 1'
    },
    {
      action:'Feature 2',
      title:'Feature 2',
      cardTitle:'Feature 2',
      cardText:'Perform Feature 2'
    },
    {
      action:'Feature 3',
      title:'Feature 3',
      cardTitle:'Feature 3',
      cardText:'Perform Feature 3'
    }
  ];

  return (
    <Router>
      <Header 
        imageSource="assets/images/dceg-logo.svg" 
        url="https://dceg.cancer.gov/"
      />    
      <Navbar links={links} />
      <Route path="/" exact={true}  render={(_) => <Home links={cardLinks} />}/>
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
