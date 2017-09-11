import React, { Component } from 'react';
import { observer } from 'mobx-react'


import { get } from 'lodash';

import FilteredObjectTree from './containers/FilteredObjectTree.js'
import DiffObjectTree from './containers/DiffObjectTree.js'
import ActionView from './ActionView.js'
import ActionList from './ActionList.js'

import createStateTreeModel from './models/StateTreeModel.js'


// components
import JsonFileImport from './components/text-file/JsonFileImport.js'
import JsonFileExport from './components/text-file/JsonFileExport.js'



// containers
import ButtonGroupSelector from './containers/ButtonGroupSelector.js'
import PatchesView from './containers/PatchesView.js'


import './DevTools.css'
import './components/icons/Icons.css'


class DevTools extends Component {

    constructor(props) {
        super(props);
        this.stepBack = this.stepBack.bind(this);
        this.stepForward = this.stepForward.bind(this);
        this.onSelectAction = this.onSelectAction.bind(this);
        this.onGotoAction = this.onGotoAction.bind(this);

        this.onSkipAction = this.onSkipAction.bind(this);
        this.saveState = this.saveState.bind(this);
        this.onClickImport = this.onClickImport.bind(this);
        this.onClickReset = this.onClickReset.bind(this);
        this.onLoadState = this.onLoadState.bind(this);

        this.onClickPlayPause = this.onClickPlayPause.bind(this);

        this.onChangeActionFilter = this.onChangeActionFilter.bind(this);

        this.onSelectStateView = this.onSelectStateView.bind(this);

        this.onClickPatchPath = this.onClickPatchPath.bind(this);

        this.onKeyDown = this.onKeyDown.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.onResize = this.onResize.bind(this);
        this.trackMouse = this.trackMouse.bind(this);

        this.mousePos = {};
        this.state = {
            height: 350,
            bottom: 0
        };
    }

    componentWillMount() {
        this.stateTreeModel = createStateTreeModel(this.props.appState);

        window.addEventListener('keydown', this.onKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown);
    }

    render() {
        let stepBackButton =
            <button
                onClick={this.stepBack}
                disabled={this.stateTreeModel.isFirstAction}
                >
                &lt;
            </button>;
        let stepForwardButton =
            <button
                onClick={this.stepForward}
                disabled={this.stateTreeModel.isLastAction}
                >
                &gt;
            </button>;

        let actionList = <ActionList
            model={this.stateTreeModel.filteredActionList}
            activeAction={this.stateTreeModel.selectedAction}
            currentAction={this.stateTreeModel.currentAction}
            onSelectAction={this.onSelectAction}
            onGotoAction={this.onGotoAction}
            onSkipAction={this.onSkipAction}
            />;



        let diffTreeView = <DiffObjectTree
            oldObject={this.stateTreeModel.stateA}
            object={this.stateTreeModel.stateB}
            highlightedPath={this.stateTreeModel.selectedAction.targetPath.split('/').join('.').substring(1)}
            objectName={'@@ROOT'}
            />;

        let stateTreeView = <FilteredObjectTree
            object={this.stateTreeModel.stateB}
            objectName={'initialSnapshot'}
            model={this.stateTreeModel.stateObjectTreeModel}
            highlightedPath={this.stateTreeModel.stateTreeHiglightedPath}
            />;


        let actionView = <ActionView model={this.stateTreeModel.selectedAction}/>;

        let patchesView = <PatchesView
            model={this.stateTreeModel.selectedAction.patches}
            onClickPath={this.onClickPatchPath}
            />;


        let stateViewMap = {
            diff: diffTreeView,
            state: stateTreeView,
            action: actionView,
            patches: patchesView
        };
        let stateViewContent = stateViewMap[this.stateTreeModel.stateViewId];

        let openButton = this.stateTreeModel.isHidden ?
            <button
                className="show-btn"
                title="Open"
                onClick={this.show}
                >
                &#x25b2;
            </button> :
            null;

        let resizeTools = get(window, 'chrome.runtime.id', false) ? null :
            <div className="mdt-resize-tools">
                <div
                    className="mdt-resize-handle"
                    draggable="true"
                    onDragStart={(ev) => {
                            ev.dataTransfer.setDragImage(document.createElement('span'), 0, 0);
                            ev.dataTransfer.setData('text','');
                            document.addEventListener('dragover', this.trackMouse, false);
                        }}
                    onDrag={this.onResize}
                    onDragEnd={(ev) => {
                            this.onResize(ev);
                            document.removeEventListener('dragover', this.trackMouse);
                        }}
                    >
                </div>

                {openButton}

                <button
                    className="hide-btn"
                    title="Close"
                    onClick={this.hide}
                    >
                    &#x1F5D9;
                </button>
            </div>
        ;


        let wrapper = <div className="dev-tools" style={{ height: this.stateTreeModel.height, bottom: this.stateTreeModel.bottom }}>

            <div className="mdt-wrapper">
                <div className="mdt-action-tools">
                    <div>
                        <button onClick={this.stateTreeModel.sweep}>SWEEP</button>
                        <button onClick={this.onClickReset}>RESET</button>
                        <button onClick={this.stateTreeModel.commit}>COMMIT</button>
                        <button onClick={this.onClickPlayPause}>
                            { this.stateTreeModel.isPlaying ? 'PAUSE' : 'PLAY' }
                        </button>

                        {stepBackButton} - {stepForwardButton}

                        <JsonFileExport object={this.stateTreeModel.store} />

                        <JsonFileImport onLoad={this.onLoadState}/>

                    </div>
                    <div>
                        <input
                            className="object-tree-filter"
                            placeholder="filter..."
                            onChange={this.onChangeActionFilter}
                            />

                    </div>
                    {actionList}
                </div>

                <div className="mdt-state-view">
                    <div>
                        <ButtonGroupSelector
                            options={[ { text: 'Action', value: 'action' }, { text: 'Patches', value: 'patches' }, { text: 'State', value: 'state' }, { text: 'Diff', value: 'diff' } ]}
                            value={this.stateTreeModel.stateViewId}
                            onClickOption={this.onSelectStateView}
                            />
                    </div>


                    { stateViewContent }


                </div>

                { resizeTools }

            </div>
        </div>;


        return wrapper;
    }


    // FIXME: export with name
    saveState(ev) {
        function download(text, name, type) {
            var a = ev.currentTarget;
            var file = new Blob([text], {type: type});
            a.href = URL.createObjectURL(file);
            a.download = name;
        }
        download(JSON.stringify(this.stateTreeModel.store, null, 2), 'state.json', 'text/plain');
    }

    onClickImport(ev) {

        try {
            this.stateTreeModel.reset(this.importedJSON);
        } catch (e) {
            console.error('The imported JSON snapshot is not compatible with the current type');
        }
        this.importedJSON = null;
    }

    onLoadState(state) {
        try {
            this.stateTreeModel.reset(state);
        } catch (e) {
            // FIXME show error
            alert('The imported JSON snapshot is not compatible with the current type');
        }
    }


    onKeyDown(ev) {
        if (ev.key === 'd' && (ev.ctrlKey || ev.altKey)) {
            ev.preventDefault();
            this.stateTreeModel.setBottom(this.stateTreeModel.bottom === 0 ? -this.stateTreeModel.height : 0);
        }
    }

    hide() {
        this.stateTreeModel.setBottom(-this.stateTreeModel.height);
    }

    show() {
        this.stateTreeModel.setBottom(0);
    }

    onResize(ev) {
        this.stateTreeModel.setHeight(window.innerHeight - this.mousePos.y || ev.clientY);
    }

    trackMouse(ev) {
        this.mousePos.x = ev.clientX;
        this.mousePos.y = ev.clientY;
    }

    onClickReset(ev) {
        this.stateTreeModel.reset();
    }


    stepBack (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.stateTreeModel.stepBack();

    }

    stepForward (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.stateTreeModel.stepForward();
    }

    onSelectAction(ev, actionItem) {
        this.stateTreeModel.selectAction(actionItem.id);
    }

    onGotoAction(ev, actionItem) {
        this.stateTreeModel.gotoAction(actionItem.id);
    }

    onSkipAction(ev, actionItem) {
        this.stateTreeModel.toggleSkipAction(actionItem.id);
    }

    onClickPlayPause(ev) {
        if (this.stateTreeModel.isPlaying) {
            this.stateTreeModel.pauseActions();
        } else {
            this.stateTreeModel.playActions();
        }
    }

    onChangeActionFilter(ev) {
        let val = ev.currentTarget.value;
        this.stateTreeModel.setActionFilter(val);
    }

    onSelectStateView(ev, viewId) {
        this.stateTreeModel.setStateView(viewId);
    }

    onClickPatchPath(ev, path) {
        this.stateTreeModel.setStateView('state');
        path = path.substring(1).replace(/\//g, '.');
        this.stateTreeModel.stateObjectTreeModel.explodePath(path, true);
        this.stateTreeModel.highlightStateTreeNode(path);
    }
}


export default observer(DevTools);