import React, { Component } from 'react'
import { pick, isEqual } from 'lodash'

import ObjectTreeValue from './ObjectTreeValue.js'

import './ObjectTree.css'

class ObjectTreeLeaf extends Component {

  constructor(props) {
    super(props);
    this.relevantProps = ['name', 'value'];
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(pick(nextProps, this.relevantProps), pick(this.props, this.relevantProps));
  }

  render() {

    let { className, name, value, depth, inRowChildren, nodePath } = this.props;

    return <div
      className={['object-tree-node object-tree-leaf', className].join(' ')}
      title={nodePath}
      >
      <div className="object-tree-row">
        <div className="indented-row" style={{marginLeft: (12*depth)+'px' }}>
          <span className="prop-name">{name}</span>
          :&nbsp;
          <ObjectTreeValue value={value}/>
          {inRowChildren}
        </div>
      </div>
    </div>;

  }

}

export default ObjectTreeLeaf;