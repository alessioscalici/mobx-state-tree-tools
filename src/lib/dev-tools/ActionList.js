import React, { Component } from 'react';
import { observer } from 'mobx-react'
import { isFunction } from 'lodash'

import ActionItem from './ActionItem.js'

class ActionList extends Component {


    constructor(props) {
        super(props);
        this.selectAction = this.selectAction.bind(this);
        this.skipAction = this.skipAction.bind(this);
        this.gotoAction = this.gotoAction.bind(this);
    }


    componentDidUpdate() {
        if (this.listElement) {
            this.listElement.scrollTop = this.listElement.scrollHeight;
        }
    }

    render() {



        let model = this.props.model;
        let actionItems = [];

        model.forEach((actionLog) => {
            actionItems.push(
                <ActionItem
                    key={actionLog.id}
                    active={this.props.activeAction === actionLog}
                    current={this.props.currentAction === actionLog}
                    name={actionLog.action.name}
                    targetTypeName={actionLog.targetTypeName}
                    args={actionLog.action.args}
                    timestamp={actionLog.timestamp}
                    delay={actionLog.delay}
                    initial={actionLog.initial}
                    skip={actionLog.skip}
                    future={actionLog.future}
                    path={actionLog.targetPath}
                    onClick={ this.selectAction(actionLog) }
                    onClickJump={ this.gotoAction(actionLog) }
                    onSkipChange={ this.skipAction(actionLog) }
                    />
            );
        });

        return <div className="mdt-actions-list" ref={(el) => { this.listElement = el; }}>
            {actionItems}
        </div>
    }

    selectAction(actionLog) {
        return (ev) => {
            if (isFunction(this.props.onSelectAction)) {
                this.props.onSelectAction(ev, actionLog);
            }
        };
    }

    skipAction(actionLog) {
        return (ev) => {
            if (isFunction(this.props.onSkipAction)) {
                this.props.onSkipAction(ev, actionLog);
            }
        };
    }

    gotoAction(actionLog) {
        return (ev) => {
            if (isFunction(this.props.onGotoAction)) {
                this.props.onGotoAction(ev, actionLog);
            }
        };
    }


}


export default observer(ActionList);