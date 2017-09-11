import React from 'react'

import ObjectTreeValue from './ObjectTreeValue.js'

import './ObjectTree.css'

export default ({ className, name, value, depth, inRowChildren }) =>

<div className={['object-tree-node object-tree-leaf', className].join(' ')}>
    <div className="object-tree-row">
        <div className="indented-row" style={{marginLeft: (12*depth)+'px' }}>
            <span className="prop-name">{name}</span>
            :&nbsp;
            <ObjectTreeValue value={value} />
            {inRowChildren}
        </div>
    </div>
</div>;
