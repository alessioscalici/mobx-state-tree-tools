import React, { Component } from 'react';
import { observer } from 'mobx-react'



class ObjectBreadcrumbs extends Component {



    constructor(props) {
        super(props);

        this.onClickNode = this.onClickNode.bind(this);

    }


    render() {

        let lastIndex = this.props.model.length-1,
            breadcrumbs = this.props.model.map((bc, i) => {
            let isLast = (i === lastIndex),
                className = 'object-breadcrumbs-node';
            if (isLast) {
                className += ' last';
            }
            return [i === 0 ? '' : ' » ', <span
                className={className}
                onClick={ !isLast && this.onClickNode(bc.path)}
                >
                {bc.text}
            </span>];
        });

        return <div className="object-breadcrumbs-line">
            {breadcrumbs}
        </div>;

    }


    onClickNode(path) {
        return (ev) => {
            this.props.onClickNode(ev, path);
        };
    }

}

export default observer(ObjectBreadcrumbs);