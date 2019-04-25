import React from 'react';
import logo from './logo.svg';
import './App.css';

import chart from './line-chart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <chart></chart>
      </header>
    </div>
  );
}

export default App;
