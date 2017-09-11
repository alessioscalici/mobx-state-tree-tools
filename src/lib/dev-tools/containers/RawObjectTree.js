import React, { Component } from 'react';
import { observer } from 'mobx-react'

import PropTypes from 'prop-types';

class RawObjectTree extends Component {

    render() {
        return <pre>
            {JSON.stringify(this.props.model, null, 2)}
        </pre>;
    }
}


RawObjectTree.propTypes = {
    model: PropTypes.any.isRequired
};

export default observer(RawObjectTree);