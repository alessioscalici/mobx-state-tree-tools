import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { forEach } from 'lodash'


import PropTypes from 'prop-types';




class ButtonGroupSelector extends Component {



    constructor(props) {
        super(props);
        this.onClickOptionButton = this.onClickOptionButton.bind(this);
    }


    render() {


        var buttonRenderers = [];
        forEach(this.props.options, (opt) => {
            let child = <button
                key={opt.value}
                className={ this.props.value === opt.value ? 'active' : '' }
                onClick={this.onClickOptionButton}
                data-value={opt.value}
                >
                {opt.text}
            </button>;
            buttonRenderers.push(child);
        });


        return <div className="mdt-button-group-selector">
            { buttonRenderers }
        </div>

    }

    onClickOptionButton(ev) {
        this.props.onClickOption(ev, ev.currentTarget.getAttribute('data-value'));
    }

}

ButtonGroupSelector.propTypes = {

    options: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        value: PropTypes.any.isRequired
    })).isRequired,

    value: PropTypes.any.isRequired,

    onClickOption: PropTypes.func.isRequired

};

export default observer(ButtonGroupSelector);