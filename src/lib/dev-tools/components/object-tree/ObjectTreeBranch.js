import React from 'react'

import CollapseIcon from '../icons/CollapseIcon.js'
import ExplodeIcon from '../icons/ExplodeIcon.js'

import './ObjectTree.css'

export default ({ children, className, name, type, path, isCollapsed, onCollapseClick, inRowChildren, depth }) =>


    <div className={['object-tree-node object-tree-branch', className].join(' ')} >
        <div className="object-tree-row">
            <div className="indented-row" style={{marginLeft: (12*depth)+'px' }}>
                <span className="pre-row">
                    <span style={{ display: children.length ? 'inline-block' : 'none' }} onClick={onCollapseClick}>
                        { isCollapsed ? <ExplodeIcon/> : <CollapseIcon/> }
                    </span>
                </span>

                <span className="prop-name">{name}</span>
                <span>: {type}</span>

                {inRowChildren}
            </div>
        </div>
        {isCollapsed ? null : children}
    </div>;


