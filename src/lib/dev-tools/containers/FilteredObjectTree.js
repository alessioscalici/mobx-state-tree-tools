import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { forEach, get, map, omit, capitalize } from 'lodash'

// components
import GearIcon from '../components/icons/GearIcon.js'

// models
import ObjectTreeModel from '../models/ObjectTreeModel.js'
import ObjectTreeViewEnum from '../models/ObjectTreeViewEnum.js'

// containers
import ObjectTreeNode from '../ObjectTreeNode.js'
import RawObjectTree from './RawObjectTree.js'
import ObjectBreadcrumbs from './ObjectBreadcrumbs.js'
import ButtonGroupSelector from './ButtonGroupSelector.js'

import './FilteredObjectTree.css'


class FilteredObjectTree extends Component {



    constructor(props) {
        super(props);

        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.pinNode = this.pinNode.bind(this);
        this.onClickBreadcrumbsNode = this.onClickBreadcrumbsNode.bind(this);
        this.onClickOption = this.onClickOption.bind(this);

    }

    componentWillMount() {
        if (this.props.model) {
            this.treeModel = this.props.model;
        } else {
            // it create an isolated model if not provided
            this.treeModel = ObjectTreeModel.create({
                name: this.props.objectName || '',
                explodedNodes: ['']
            });
            this.treeModel.setObject(this.props.object);
        }
    }

    componentWillReceiveProps(props) {
        this.treeModel.setObject(props.object);
    }

    render() {

        let objectDisplay = null;
        switch (this.treeModel.treeView) {
            case ObjectTreeViewEnum.TREE_VIEW:
                objectDisplay = <ObjectTreeNode treeModel={this.treeModel}
                                                node={this.treeModel.pinnedNode}
                                                name={this.treeModel.pinnedName}
                                                highlightedPath={this.props.highlightedPath}/>;
                break;
            case ObjectTreeViewEnum.RAW_VIEW:
                objectDisplay = <RawObjectTree model={this.treeModel.pinnedNode}/>;
                break;
            case ObjectTreeViewEnum.FILTERED_VIEW:
                if (this.treeModel.selectedNodes.length) {
                    objectDisplay = [];
                    forEach(this.treeModel.selectedNodes, (path) => {
                        let node = get(this.treeModel.store, path),
                            model = ObjectTreeModel.create({
                                name: path || ''
                            });
                        model.setObject(node);
                        objectDisplay.push(<div><ObjectTreeNode treeModel={model} node={node} name={path} /><hr/></div>);
                    })
                } else {
                    objectDisplay = <span>No results</span>
                }
                break;
            default:
                break;
        }


        // FIXME deduplicate viewSelector
        let optionsObject = omit(ObjectTreeViewEnum, 'FILTERED_VIEW'),
            selectorOptions = map(optionsObject, (v, k) => {
                return { value: v, text: capitalize(v) }
            }),

            viewSelector = this.treeModel.showViewSelector ? <ButtonGroupSelector
                options={selectorOptions}
                value={this.treeModel.treeView}
                onClickOption={this.onClickOption}
                /> :
                null;


        let filterInput = this.treeModel.showFilter ?
            <input className="object-tree-filter" placeholder="filter..." onChange={this.onChangeFilter}/> :
            null;

        let breadcrumbs = this.treeModel.showPin ?
            <ObjectBreadcrumbs model={this.treeModel.breadcrumbs} onClickNode={this.onClickBreadcrumbsNode}/> :
            null;

        // FIXME complete this dev
        let toolsRenderer = <div className="object-tree-tools">
                <div className="object-tree-filter-line">
                    { filterInput }
                    <div className="right-bar">
                        { viewSelector }
                    </div>
                </div>
                { breadcrumbs }
            </div>;

        return <div className="mdt-filtered-object-tree">
            { toolsRenderer }

            <div className="object-view">
                <button className="tools-button"><GearIcon /></button>
                { objectDisplay }
            </div>
        </div>

    }

    onChangeFilter(ev) {
        this.treeModel.setSearchFilter(ev.currentTarget.value);
    }

    pinNode(path) {
        return () => {
            this.treeModel.pinNode(path);
        };
    }

    onClickBreadcrumbsNode(ev, path) {
        this.treeModel.pinNode(path);
    }

    onClickOption(ev, option) {
        this.treeModel.setTreeView(option);
    }

}

export default observer(FilteredObjectTree);