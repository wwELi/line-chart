import React from 'react';
import logo from './logo.svg';

import './App.css';
import lineChart from './line-chart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <line-chart />
      </header>
    </div>
  );
}

export default App;
