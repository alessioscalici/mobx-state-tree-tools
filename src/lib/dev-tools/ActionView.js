import React, { Component } from 'react';
import { observer } from 'mobx-react'

import { isEmpty } from 'lodash'

// components
import FilteredObjectTree from './containers/FilteredObjectTree.js'


import './ActionView.css'

class ActionView extends Component {


    render() {

        let actionItem = this.props.model;

        let argsRenderer = isEmpty(actionItem.action.args) ? null : <FilteredObjectTree objectName="args" object={ actionItem.action.args }/>;


        let patchesRenderer = <FilteredObjectTree
            objectName="patches"
            object={ actionItem.patches }
            />;


        return <div className="mdt-action-view">
            <div className="action-name">{actionItem.fullName}</div>
            <div className="action-path">{actionItem.targetPath}</div>
            { argsRenderer }
            <div>
                { patchesRenderer }
            </div>
        </div>;
    }

}



export default observer(ActionView);