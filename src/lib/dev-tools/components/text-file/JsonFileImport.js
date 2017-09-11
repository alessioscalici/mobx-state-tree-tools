import React, { Component } from 'react';
import { observer } from 'mobx-react'





class JsonFileImport extends Component {



    constructor(props) {
        super(props);
        this.onChangeFile = this.onChangeFile.bind(this);
        this.onClickImport = this.onClickImport.bind(this);


        this.state = {
            status: 'empty',
            fileName: '',
            errorText: ''
        };
    }


    render() {
        let isEmpty = !this.state.fileName,
            className = 'text-file-import';
        if (this.state.status) {
            className += ' ' + this.state.status;
        }

        return <span className={className}>
            <input
                style={{ display: 'none' }}
                accept=".json"
                type="file"
                name="files[]"
                onChange={this.onChangeFile}
                ref={(input) => { this.fileInput = input; }}
                />
            <button
                onClick={this.onClickImport}
                className={'btn-' + this.state.status}
                >
                { isEmpty ? 'Load state' : 'Import "' + this.state.fileName + '"' }
            </button>
            <span className="text-error">{this.state.errorText}</span>
        </span>
    }

    // TODO: export with name
    onClickImport(ev) {
        if (this.state.fileName) {

            if (this.props.onLoad) {
                this.props.onLoad(this.importedJSON);
            }

            this.importedJSON = null;
            this.fileInput.value = '';
            this.setState({
                status: 'empty',
                fileName: '',
                errorText: ''
            });
        } else {
            this.fileInput.click();
        }
    }

    onChangeFile(ev) {


        let input = ev.currentTarget,
            file = input.files && input.files[0],
            reader = new FileReader();

        if (!file) {
            return;
        }

        var me = this;
        // Closure to capture the file information.
        reader.onload = (() => {
            return (e) => {

                me.importedJSON = null;
                try {
                    me.importedJSON = JSON.parse(e.target.result);
                    console.info( 'importedJSON', me.importedJSON );
                    me.setState({
                        status: 'success',
                        fileName: me.fileInput.files[0].name,
                        errorText: ''
                    });
                } catch (e) {

                    me.fileInput.value = '';
                    console.error(e);
                    me.setState({
                        status: 'error',
                        fileName: '',
                        errorText: 'Error loading "'+ file.name +'"'
                    });
                }

            };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsText(file);

    }


}

export default observer(JsonFileImport);