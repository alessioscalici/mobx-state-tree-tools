import React, { Component } from 'react'
import { observer } from 'mobx-react'





class JsonFileExport extends Component {



    constructor(props) {
        super(props);
        this.onClickSave = this.onClickSave.bind(this);


        this.state = {
            status: 'empty',
            fileName: '',
            errorText: ''
        };
    }


    render() {
        let className = 'json-file-export';
        if (this.state.status) {
            className += ' ' + this.state.status;
        }

        return <span className={className}>
            <a
                onClick={this.onClickSave}
                >
                <button
                    className={'btn-' + this.state.status}
                    >
                    Save state
                </button>
            </a>
            <span className="text-error">{this.state.errorText}</span>
        </span>
    }

    onClickSave(ev) {
        function download(text, name, type) {
            var a = ev.currentTarget;
            var file = new Blob([text], {type: type});
            a.href = URL.createObjectURL(file);
            a.download = name;
        }
        let json = this.props.object.toJSON ? this.props.object.toJSON() : this.props.object;
        download(JSON.stringify(json, null, 2), 'state.json', 'text/plain');
    }

}

export default observer(JsonFileExport);