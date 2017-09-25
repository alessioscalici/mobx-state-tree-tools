import React, { Component } from 'react';

import './App.css';

import Timer from './components/Timer.js'
import appState from './state/app.js'

import MobxDevTools from 'mobx-react-devtools'

import DevTools from '../lib'




class App extends Component {
  render() {

    return (
      <div className="App">
        <MobxDevTools/>

        <Timer appState={appState}/>


        <button onClick={ () => { appState.popValue() } }>POP value</button>
        <button onClick={ () => { appState.timer.increment() } }>+</button>
        <button onClick={ () => { appState.timer.decrement() } }>-</button>

        <button onClick={ () => {
            for (let i=0; i<800; ++i) {
                appState.timer.increment();
            }
         } }>++++</button>

        <DevTools appState={appState}/>
      </div>
    );
  }
}

export default App;
