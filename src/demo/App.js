import React, { Component } from 'react';
import './App.css';

import Timer from './components/Timer.js'
import appState from './state/app.js'

import MobxDevTools from 'mobx-react-devtools'

import DevTools from '../lib/dev-tools/DevTools.js'



class App extends Component {
  render() {

      let pippo = {
          payload: {
              nenni: [1,2,3,4,5]
          },
          meta: {
              pappo: '12345',
              peppo: /abcdef/
          }
      };
    return (
      <div className="App">
        <MobxDevTools/>

        <Timer appState={appState}/>


        <button onClick={ () => { appState.popValue() } }>POP value</button>
        <button onClick={ () => { appState.timer.increment( pippo ) } }>+</button>
        <button onClick={ () => { appState.timer.decrement() } }>-</button>

        <button onClick={ () => {
            for (let i=0; i<10; ++i) {
                appState.timer.increment();
            }
         } }>++++</button>

        <DevTools appState={appState}/>
      </div>
    );
  }
}

export default App;
