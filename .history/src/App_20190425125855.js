import React from 'react';
import logo from './logo.svg';

import './App.css';
import LineChart from './line-chart';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <LineChart />
      </header>
    </div>
  );
}

export default App;
