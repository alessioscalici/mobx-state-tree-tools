import React, { Component } from 'react';
import { isObservableArray } from 'mobx'
import { observer } from 'mobx-react'
import { getType, isStateTreeNode } from 'mobx-state-tree'
import { isArray, isObject, isDate, isFunction, forEach, isRegExp, compact, get, keys, range, union, uniqBy } from 'lodash'

// components
import ObjectTreeLeaf from './components/object-tree/ObjectTreeLeaf.js'
import ObjectTreeBranch from './components/object-tree/ObjectTreeBranch.js'
import PinIcon from './components/icons/PinIcon.js'
import ExplodeAllIcon from './components/icons/ExplodeAllIcon.js'
import CollapseAllIcon from './components/icons/CollapseAllIcon.js'


class ObjectTreeNode extends Component {


  constructor(props) {
    super(props);
    this.onCollapseClick = this.onCollapseClick.bind(this);
    this.isStateTreeCollapsed = this.isStateTreeCollapsed.bind(this);
    this.setStateTreeCollapsed = this.setStateTreeCollapsed.bind(this);
    this.onClickPin = this.onClickPin.bind(this);
    this.onClickPinLeaf = this.onClickPinLeaf.bind(this);
    this.getFullNodePath = this.getFullNodePath.bind(this);
    this.onClickExplodeChildren = this.onClickExplodeChildren.bind(this);
    this.onClickCollapseChildren = this.onClickCollapseChildren.bind(this);

  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {

    let treeModel = this.props.treeModel;

    let nodePath = this.getFullNodePath(),
      depth = this.props.depth || 0,
      node = this.props.node,
      nodeType = isStateTreeNode(node) ?
        getType(node).name :
        isArray(node) || isObservableArray(node) ?
        'Array(' + node.length + ')' :
          typeof node,
      nodeName = this.props.name,

      pinPath = this.props.pinPath;


    if (!this.isBranch(node)) {

      return <ObjectTreeLeaf
        name={nodeName}
        type={nodeType}
        value={node}
        nodePath={this.getFullNodePath()}
        depth={depth}
        />;
    }


    let childRenderers = [];


    function getKeys(obj) {
      if (isArray(obj) || isObservableArray(obj)) {
        return range(obj.length);
      }
      return keys(obj);
    }

    // TODO: diff
    let diffParent = get(this.props.diffNode, 'diff');
    var props = getKeys(this.props.node);
    if (diffParent) {
      props = uniqBy(union(props, getKeys(diffParent)), (el) => {
        return el + ''
      });
    }
    let diffPreviousState = this.props.diffPreviousState;
    let baseClassName = this.props.className || '',
    //      showOnlyChanged = treeModel.showOnlyChanged, // FIXME use to show only changed nodes
      showDiff = treeModel.showDiff,
      diffOp = this.props.diffNode && this.props.diffNode.op,
      highlightedPath = this.props.highlightedPath;


    forEach(props, (k) => {

      let diffNode = get(this.props.diffNode, 'diff.' + k),
        diffOp = get(diffNode, 'op'),
        isPlaceHolder = (diffPreviousState && diffOp === 'add') || (!diffPreviousState && diffOp === 'remove'),
        v = isPlaceHolder ? diffParent[k].newValue || diffParent[k].oldValue : this.props.node[k]
        ;


      if (isFunction(v)) {
        return;
      }

      let childNodePath = compact([this.props.nodePath, k + '']).join('.');

      const isFilteredOut = treeModel.isPathFiltered(childNodePath);
      if (isFilteredOut) {
        return null;
      }

      let className = compact([baseClassName, isPlaceHolder ? 'diff-placeholder' : '']).join(' ');

      let child = null;
      if (this.isBranch(v)) {


        // branch
        child = <ObjectTreeNode
          key={childNodePath}
          className={className}
          name={k}
          node={v}
          treeModel={treeModel}
          pinPath={pinPath}
          nodePath={childNodePath}
          depth={depth+1}

          diffNode={diffNode}
          diffPreviousState={diffPreviousState}
          highlightedPath={highlightedPath}
          hidePin={this.props.hidePin}
          />;

      } else {
        // leaf
        let onHoverIcons = this.props.hidePin ? null : <span className="visible-on-hover">
                    <span onClick={this.onClickPinLeaf(childNodePath)}>
                        <PinIcon />
                    </span>
                </span>;


        className = compact([
          className,
          showDiff && diffOp ? 'diff-op-' + diffOp : '',
          childNodePath === highlightedPath ? 'target-node' : ''
        ]).join(' ');

        child = <ObjectTreeLeaf
          key={childNodePath}
          className={className}
          name={k}
          type={typeof v}
          value={v}
          nodePath={childNodePath}
          depth={depth+1}
          inRowChildren={onHoverIcons}
          />

      }
      childRenderers.push(child);
    });


    let isCollapsed = this.isStateTreeCollapsed();


    let pinIcon = this.props.hidePin ?
      null :
      <span title="Pin node" onClick={this.onClickPin}><PinIcon /></span>;

    let onHoverIcons = <span className="visible-on-hover">
            { pinIcon }
      <span title="Explode all" onClick={this.onClickExplodeChildren}><ExplodeAllIcon /></span>
            <span title="Collapse all" onClick={this.onClickCollapseChildren}><CollapseAllIcon /></span>
        </span>;


    let className = [];
    if (showDiff && diffOp) {
      className.push('diff-op-' + diffOp);
    }
    if (nodePath === highlightedPath) {
      className.push('target-node');
    }
    if ((diffPreviousState && diffOp === 'add') || (!diffPreviousState && diffOp === 'remove')) {
      className.push('diff-placeholder');
    }
    className = className.join(' ');


    return <ObjectTreeBranch
      className={className}
      name={nodeName}
      path={this.getFullNodePath()}
      type={nodeType}
      nodePath={nodePath}
      isCollapsed={isCollapsed}
      onCollapseClick={this.onCollapseClick}
      inRowChildren={onHoverIcons}
      depth={depth+1}
      >
      {childRenderers}
    </ObjectTreeBranch>;
  }

  isBranch(model) {
    return ( isStateTreeNode(model) || (isObject(model) && !isDate(model) && !isRegExp(model)) || isArray(model));
  }

  onCollapseClick(ev) {
    let isCollapsed = this.isStateTreeCollapsed();
    this.setStateTreeCollapsed(!isCollapsed);
  }

  isStateTreeCollapsed() {
    return !this.props.treeModel.isPathExploded(this.getFullNodePath());
  }

  setStateTreeCollapsed(val) {
    if (val) {
      this.props.treeModel.collapseNode(this.getFullNodePath());
    } else {
      this.props.treeModel.explodeNode(this.getFullNodePath());
    }
  }

  getFullNodePath() {
    let nodePath = compact([
      this.props.treeModel.pinPath,
      this.props.nodePath
    ]).join('.');
    return nodePath;
  }

  onClickPin(ev) {
    this.props.treeModel.pinNode(this.getFullNodePath());
  }

  onClickPinLeaf(path) {
    let nodePath = compact([
      this.props.treeModel.pinPath,
      path
    ]).join('.');
    return (ev) => {
      this.props.treeModel.pinNode(nodePath);
    };
  }

  onClickExplodeChildren(ev) {
    this.props.treeModel.explodeAllChildren(this.getFullNodePath());
  }

  onClickCollapseChildren(ev) {
    this.props.treeModel.collapseAllChildren(this.getFullNodePath());
  }

}


export default observer(ObjectTreeNode);