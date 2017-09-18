import React from 'react'

import CollapseIcon from '../icons/CollapseIcon.js'
import ExplodeIcon from '../icons/ExplodeIcon.js'

import './ObjectTree.css'

class ObjectTreeBranch extends React.Component {



    constructor(props) {
        super(props);

    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.children.length !== this.props.children.length ||
            (nextProps.isCollapsed !== this.props.isCollapsed)
    }

    render() {


        let { children, className, name, type, path, isCollapsed, onCollapseClick, inRowChildren, depth } = this.props;


        return <div className={['object-tree-node object-tree-branch', className].join(' ')} title={path}>
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

    }



}



export default ObjectTreeBranch;


