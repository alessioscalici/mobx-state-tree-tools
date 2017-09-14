import React, { Component } from 'react';
import { observer } from 'mobx-react'
import { isFunction, isEqual, pick } from 'lodash'

import './ActionItem.css'

class ActionItem extends Component {

    /**
     *
     * @param props:
     *      {string} name
     *      {boolean} active
     *      {boolean} isFuture (when time traveling, and the current action is prior to this)
     *      {boolean} skip (when time traveling, skip this action in the calculated state)
     */
    constructor(props) {
        super(props);
        this.clickJump = this.clickJump.bind(this);
        this.clickSkip = this.clickSkip.bind(this);
        this.onMouseInRightBar = this.onMouseInRightBar.bind(this);
        this.onMouseOutRightBar = this.onMouseOutRightBar.bind(this);

        this.state = {
            rightBarHover: false
        };

        this.relevantProps = ['active', 'current', 'skip', 'future'];
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.rightBarHover !== nextState.rightBarHover ||
            !isEqual(pick(this.props, this.relevantProps), pick(nextProps, this.relevantProps));
    }

    render() {

        let className = [
            'mdt-action-item',
            this.props.active ? 'active' : 'inactive',
            this.props.current ? 'current' : '',
            this.props.skip ? 'skipped' : '',
            this.props.future ? 'future' : ''
        ].join(' ');

        let date;
        if (this.props.initial) {
            let d = new Date(this.props.timestamp);
            date = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds();
        } else {
            date = '+' + this.props.delay + 'ms'
        }

        let path = this.props.path;


        let skipBtn =
        <button
            onClick={this.clickSkip}
            disabled={this.props.initial}
            >
            {this.props.skip ? 'unskip' : 'skip' }
        </button>;

        let jumpBtn =
            <button
                onClick={this.clickJump}
                disabled={this.props.skip || this.props.current}
                >
                jump
            </button>;

        let rightBarContent = this.state.rightBarHover ?
            <span> {skipBtn} {jumpBtn} </span> :
            date;

        return (<div
            className={className}
            onClick={this.props.onClick}
            onMouseOver={this.onMouseInRightBar}
            onMouseLeave={this.onMouseOutRightBar}
            >

            <div title={path}>
                {this.props.targetTypeName}.{this.props.name}
                <span
                    className="right-bar"
                    >
                    {rightBarContent}
                </span>
            </div>
        </div>);
    }

    clickJump(ev) {
        if (isFunction(this.props.onClickJump)) {
            ev.preventDefault();
            ev.stopPropagation();
            this.props.onClickJump(ev);
        }
    }

    clickSkip(ev) {
        if (isFunction(this.props.onSkipChange)) {
            ev.preventDefault();
            ev.stopPropagation();
            this.props.onSkipChange(ev);
        }
    }

    onMouseInRightBar(ev) {
        this.setState({
            rightBarHover: true
        });
    }

    onMouseOutRightBar(ev) {
        this.setState({
            rightBarHover: false
        });
    }

}


export default observer(ActionItem);