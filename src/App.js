import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CookiesProvider } from 'react-cookie';
import Home from './pages/Home/Home.jsx'
import Landing from './pages/Landing/Landing.jsx'
import './App.css';

class App extends Component {
  render() {
    return (
      <CookiesProvider>
        <Router basename={process.env.PUBLIC_URL}>
        <div>
          <Route path='/' exact component={Landing} />
          <Route path='/home' component={Home} />
        </div>
        </Router>
      </CookiesProvider>
    );
  }
}

export default App;
