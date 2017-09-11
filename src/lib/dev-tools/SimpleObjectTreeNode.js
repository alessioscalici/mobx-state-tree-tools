import React, { Component } from 'react';
import { observer } from 'mobx-react'
import { isObservableArray } from 'mobx'
import { getType, isStateTreeNode, getPath } from 'mobx-state-tree'
import { isArray, isObject, isDate, isFunction, forEach, get, find, keys, isRegExp } from 'lodash'

// components
import ObjectTreeLeaf from './components/object-tree/ObjectTreeLeaf.js'
import ObjectTreeBranch from './components/object-tree/ObjectTreeBranch.js'
import PinIcon from './components/icons/PinIcon.js'





class SimpleObjectTreeNode extends Component {



    constructor(props) {
        super(props);
        this.onCollapseClick = this.onCollapseClick.bind(this);

        this.state = { collapsed: true };
    }

    render() {

        var nodeType = this.props.type || typeof this.props.node;

        if (!isObject(this.props.node)) {
            return <ObjectTreeLeaf name={this.props.name} type={nodeType} value={this.props.node} />;
        }

        let childRenderers = [];

        forEach(this.props.node, (v, k) => {
            if (isFunction(v)) {
                return;
            }


            let child = null;
            if (isStateTreeNode (v) || (isObject(v) && !isDate(v) && !isRegExp(v)) || isArray(v)) {
                // branch
                let nodePath = (this.props.nodePath || '')  + '/' + k;
                child = <SimpleObjectTreeNode
                    name={k}
                    node={v}
                    pinNode={this.props.pinNode}
                    nodePath={nodePath}/>;

            } else {
                // leaf
                child = <ObjectTreeLeaf name={k} type={typeof v} value={v} />
            }
            childRenderers.push(child);
        });




        var nodePath = this.props.nodePath;


        let isCollapsed = this.state.collapsed;


        var pinIcon = isFunction(this.props.pinNode) ?
            <span className="visible-on-hover"><PinIcon onClick={this.props.pinNode(nodePath)}/></span> :
            null;


        return <ObjectTreeBranch
            name={this.props.name}
            type={nodeType}
            path={nodePath}
            isCollapsed={isCollapsed}
            onPin={this.props.onPin}
            onCollapseClick={this.onCollapseClick}
            inRowChildren={pinIcon}
            >

            {childRenderers}
        </ObjectTreeBranch>;
    }


    onCollapseClick(ev) {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }



}



export default observer(SimpleObjectTreeNode);