import React from 'react'


export default ({ onClick, isCollapsed }) =>

<span
    className="collapse-icon"
    role="img"
    aria-label="collapse"
    onClick={onClick}
    >
    { getCollapsedIconRenderer(isCollapsed) }
</span>
;

function getCollapsedIconRenderer(isCollapsed) {
    if (isCollapsed) {
        return <span>&#x25b6;</span>
    }
    return <span>&#x25bc;</span>
}