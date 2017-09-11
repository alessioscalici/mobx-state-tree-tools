import React, { Component } from 'react';
import { observer } from 'mobx-react'



class Timer extends Component {

    constructor(props) {
        super(props);
        this.onReset = this.onReset.bind(this);
    }
    render() {


        return (<div onClick={this.onReset} >{ this.props.appState.timer.value }</div>);
    }

    onReset (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.appState.timer.reset();

    }


}


export default observer(Timer);