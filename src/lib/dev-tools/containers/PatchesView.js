import React, { Component } from 'react';
import { observer } from 'mobx-react'

import { map } from 'lodash'

// components
import FilteredObjectTree from './FilteredObjectTree.js'




class PatchesView extends Component {


    constructor(props) {
        super(props);
        this.onPathClick = this.onPathClick.bind(this);
    }

    render() {

        let patches = this.props.model,
            viewContent = null;

        if (patches.length === 0) {
            viewContent = 'No patches.';
        } else {
            viewContent = map(patches, (patch, i) => {
                return <div className="patch-list-item" key={i}>
                    <div className="patch-op">{patch.op}</div>
                    <a href={patch.path} onClick={this.onPathClick} className="patch-path">{patch.path}</a>
                    <FilteredObjectTree objectName="" object={patch.value} />
                </div>;
            });
        }


        return <div className="mdt-patches-view">
            { viewContent }
        </div>;
    }

    onPathClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.onClickPath(ev, ev.currentTarget.getAttribute('href'));
    }

}



export default observer(PatchesView);