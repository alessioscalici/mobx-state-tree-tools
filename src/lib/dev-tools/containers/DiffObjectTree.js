import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { forEach, get, map, omit, capitalize } from 'lodash'

// models
import ObjectDiffTreeModel from './../models/ObjectDiffTreeModel.js'
import ObjectTreeViewEnum from '../models/ObjectTreeViewEnum.js'

// containers
import ObjectTreeNode from './../ObjectTreeNode.js'
import RawObjectTree from './RawObjectTree.js'
import ObjectBreadcrumbs from './ObjectBreadcrumbs.js'
import ButtonGroupSelector from './ButtonGroupSelector.js'





class DiffObjectTree extends Component {



    constructor(props) {
        super(props);

        this.onChangeFilter = this.onChangeFilter.bind(this);
        this.pinNode = this.pinNode.bind(this);
        this.onClickBreadcrumbsNode = this.onClickBreadcrumbsNode.bind(this);
        this.onClickOption = this.onClickOption.bind(this);

        this.treeModel = props.model;
    }

    render() {


        let objectDisplay = null;
        switch (this.treeModel.treeView) {
            case ObjectTreeViewEnum.TREE_VIEW:
                objectDisplay = <div className="diff-trees-comparison">
                    <ObjectTreeNode
                        treeModel={this.treeModel}
                        node={this.treeModel.pinnedOldNode}
                        diffNode={this.treeModel.pinnedDiffNode}
                        diffPreviousState={true}
                        highlightedPath={this.props.highlightedPath}
                        name={this.treeModel.pinnedName}
                        />

                    <ObjectTreeNode
                        treeModel={this.treeModel}
                        node={this.treeModel.pinnedNode}
                        diffNode={this.treeModel.pinnedDiffNode}
                        diffPreviousState={false}
                        highlightedPath={this.props.highlightedPath}
                        name={this.treeModel.pinnedName}
                        />
                </div>;
                break;
            case ObjectTreeViewEnum.RAW_VIEW:
                objectDisplay = <div className="diff-trees-comparison">
                        <RawObjectTree model={this.treeModel.pinnedOldNode}/>
                        <RawObjectTree model={this.treeModel.pinnedNode}/>
                    </div>;
                break;
            case ObjectTreeViewEnum.FILTERED_VIEW:
                if (this.treeModel.selectedNodes.length) {
                    let oldArray = [],
                        newArray = [];
                    forEach(this.treeModel.selectedNodes, (path, i) => {
                        let node = get(this.treeModel.store, path),
                            oldNode = get(this.treeModel.oldObject, path);
                        let model = ObjectDiffTreeModel.create({
                            name: path || ''
                        });
                        model.setObject(node);
                        model.setOldObject(oldNode);
                        let diffNode = this.treeModel.getDiffNode(path);
                        oldArray.push(<div key={i}>
                                <ObjectTreeNode treeModel={model} node={model.pinnedOldNode} name={path} diffNode={diffNode}
                                                diffPreviousState={true} hidePin={true} />
                                <hr/>
                            </div>);
                        newArray.push(<div key={i}>
                            <ObjectTreeNode treeModel={model} node={model.pinnedNode} name={path} diffNode={diffNode}
                                            diffPreviousState={false} hidePin={true} />
                            <hr/>
                        </div>);

                    })
                    objectDisplay = <div className="diff-trees-comparison">
                        <div>
                            { oldArray }
                        </div>
                        <div>
                            { newArray }
                        </div>
                    </div>;
                } else {
                    objectDisplay = <span>No results</span>
                }
                break;
            default:
                break;
        }


        let optionsObject = omit(ObjectTreeViewEnum, 'FILTERED_VIEW'),
            selectorOptions = map(optionsObject, (v, k) => {
                return { value: v, text: capitalize(v) }
            }),

            viewSelector = <ButtonGroupSelector
                options={selectorOptions}
                value={this.treeModel.treeView}
                onClickOption={this.onClickOption}
                />;


        return <div className="mdt-diff-object-tree">
            <div className="object-tree-filter-line">
                <input className="object-tree-filter" placeholder="filter..." onChange={this.onChangeFilter}/>
                <div className="right-bar">
                    { viewSelector }
                </div>
            </div>
            <ObjectBreadcrumbs model={this.treeModel.breadcrumbs} onClickNode={this.onClickBreadcrumbsNode}/>


            {objectDisplay}
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

export default observer(DiffObjectTree);