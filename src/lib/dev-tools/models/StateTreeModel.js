


import { types, getSnapshot, onPatch, applyAction , applySnapshot, addMiddleware, getType, clone, isStateTreeNode, getPath, resolvePath } from "mobx-state-tree"
import { debounce, uniqueId, findIndex, find, forEach, last, first, filter, findLast} from 'lodash'



import ObjectTreeModel from '../models/ObjectTreeModel.js'
import ObjectDiffTreeModel from '../models/ObjectDiffTreeModel.js'


const ActionLogModel = types.model('ActionLog',
    {
        id: types.identifier(types.string),
        timestamp: types.optional(types.number, Date.now), // populated upon creation
        delay: types.number,
        initial: types.boolean,
        future: types.boolean,
        skip: types.boolean,
        targetPath: types.string,
        action: types.frozen,
        targetTypeName: types.string,
        patches: types.array(types.frozen),
        get fullName() {
            return this.targetTypeName + '.' + this.action.name;
        }
    }
);

const ActionLogFactory = {
    createFromAction: (action, patches, initial, delay) => { // FIXME initial and delay
        let actionLogItem = ActionLogModel.create({
                id: 'act_' + Date.now() + '_' + uniqueId(),
                skip: false,
                targetPath: action && isStateTreeNode(action.object) ? getPath(action.object) : '',
                targetTypeName: action && isStateTreeNode(action.object) ? getType(action.object).name : '',
                action: action,
                patches: patches,
                delay: delay,
                initial: initial,
                future: false
            });
        return actionLogItem;
    }
};



const createStateTreeModel = (store) => {

    let StoreType = getType(store);

    const StateTreeModel = types.model('StateTree',
        {
            stateA: StoreType,
            stateB: StoreType,
            actionLog: types.array(ActionLogModel),
            currentAction: types.reference(ActionLogModel),
            selectedAction: types.reference(ActionLogModel),
            initialSnapshot: types.frozen,
            stateViewId: types.optional(
                types.union(...['action', 'patches', 'state', 'diff'].map(types.literal)),
                'diff'
            ),
            stateObjectTreeModel: ObjectTreeModel,

            diffTree: ObjectDiffTreeModel,

            get isFirstAction () {
                return this.currentAction === this.actionLog[0];
            },
            get isLastAction () {
                return this.currentAction === this.actionLog[this.actionLog.length - 1];
            },
            get isTimeTraveling () {
                return !this.isLastAction;
            },
            get curActionIndex () {
                return this.actionLog.indexOf(this.currentAction);
            },
            get nextAction () {
                if (this.isLastAction) {
                    return null;
                }
                for (let i = this.curActionIndex + 1; i < this.actionLog.length; ++i) {
                    if (this.actionLog[i].skip === false) {
                        return this.actionLog[i];
                    }
                }
                return null;
            },
            get prevAction () {
                if (this.isFirstAction) {
                    return null;
                }
                for (let i = this.curActionIndex - 1; i >= 0; --i) {
                    if (this.actionLog[i].skip === false) {
                        return this.actionLog[i];
                    }
                }
                return null;
            },
            get isPlaying() {
                return this.interval !== null;
            },
            get filteredActionList() {
                if (! this.actionFilter) {
                    return this.actionLog;
                }
                return filter(this.actionLog, (action) => {
                    return action.fullName.indexOf(this.actionFilter) !== -1 ;
                });
            },
            get isHidden() {
                return this.bottom !== 0;
            }
        },
        {   // volatile state
            isActionLogDisabled: false,
            store: null,
            interval: null,
            actionFilter: '',

            // dynamic style
            height: 350,
            bottom: 0
        },
        {
            setStore(store) {
                this.store = store;
            },

            logActions(actionBuffer) {

                let actionLogItem;
                forEach(actionBuffer, (bufferLogItem) => {
                    actionLogItem = ActionLogFactory.createFromAction(
                        bufferLogItem.action,
                        bufferLogItem.patches,
                        !this.actionLog.length,
                        this.actionLog.length ? Date.now() - last(this.actionLog).timestamp : 0
                    );
                    this.actionLog.push(actionLogItem);
                });

                this.currentAction = actionLogItem;
                applyActionsUntil(this, this.stateA, actionLogItem.id, false);
                applyActionsUntil(this, this.stateB, actionLogItem.id, true);
                this.selectedAction = actionLogItem;
            },
            selectAction(actionId) {
                this.selectedAction = actionId;
                applyCalculatedState(this, actionId);
            },
            gotoAction(actionId) {
                this.currentAction = actionId;
                this.selectedAction = actionId; // also selects the action
                applyCalculatedState(this, actionId);
                this.isActionLogDisabled = true;
                applySnapshot(this.store, getSnapshot(this.stateB));
                this.isActionLogDisabled = false;
                updateFutureFlag(this, actionId);
            },
            toggleSkipAction(actionId, skip) {
                let actionLog = find(this.actionLog, { id: actionId });
                actionLog.skip = !actionLog.skip;
                this.gotoAction(this.currentAction.id);
            },
            stepBack() {
                let prevAction = this.prevAction;
                if (prevAction) {
                    this.gotoAction(prevAction.id);
                }
            },
            stepForward() {
                let nextAction = this.nextAction;
                if (nextAction) {
                    this.gotoAction(nextAction.id);
                }
            },
            reset(snapshot) {
                this.initialSnapshot = snapshot || this.initialSnapshot;
                this.isActionLogDisabled = true;
                this.currentAction = this.actionLog[0];
                this.selectedAction = this.currentAction;
                this.actionLog = [this.actionLog[0]];
                applySnapshot(this.store, this.initialSnapshot);
                applySnapshot(this.stateA, this.initialSnapshot);
                applySnapshot(this.stateB, this.initialSnapshot);
                this.isActionLogDisabled = false;

            },
            resetAll(snapshot) {
                applySnapshot(this, snapshot);
                this.currentAction = last(this.actionLog);
                this.selectedAction = this.currentAction;
                this.isActionLogDisabled = false;
                this.gotoAction(this.currentAction.id);
            },
            sweep() {
                if (this.currentAction.skip === true) {
                    let currentAction = findLast(this.actionLog, { skip: false });
                    this.gotoAction(currentAction.id);
                }
                this.actionLog = filter(this.actionLog, { skip: false });
            },
            commit() {
                this.initialSnapshot = getSnapshot(this.store);
                this.reset();
            },
            playActions() {
                // TODO speed options
                this.gotoAction(first(this.actionLog).id);

                var instance = this;

                this.interval = setInterval(() => {
                    instance.stepForward();
                    if (instance.isLastAction) {
                        instance.pauseActions();
                    }
                }, 1000);
            },
            pauseActions() {
                if (this.interval) {
                    clearInterval(this.interval);
                    this.interval = null;
                }
            },
            setActionFilter(filter) {
                this.actionFilter = filter;
            },
            setStateView(viewId) {
                this.stateViewId = viewId;
            },

            setHeight(intValue) {
                this.height = intValue;
            },

            setBottom(intValue) {
                this.bottom = intValue;
            }
        });



    // the initial action (jumping on it, you go to the initial state)
    var initialAction = ActionLogFactory.createFromAction(
        { name: '@@INIT', args: [], object: store },
        [],
        true,
        0);


    let stateObjectTreeModel = ObjectTreeModel.create({
        explodedNodes: [''],
        name: 'state'
    });
    stateObjectTreeModel.setObject(store);

    let diffTreeModel = ObjectDiffTreeModel.create({
        name: '@@ROOT',
        explodedNodes: ['']
    });

    let stateA = clone(store),
        stateB = clone(store);

    diffTreeModel.setObject(stateB);
    diffTreeModel.setOldObject(stateA);

    let instance = StateTreeModel.create(
        {
            stateA: stateA,
            stateB: stateB,
            actionLog: [
                initialAction
            ],
            currentAction: initialAction,
            selectedAction: initialAction,
            initialSnapshot: getSnapshot(store),
            stateObjectTreeModel: stateObjectTreeModel,
            diffTree: diffTreeModel
        }
    );
    instance.setStore(store);


    let actionsBuffer = [];

    onPatch(store, (patch) => {
        if (instance.isActionLogDisabled)
            return;
        let lastBuffered = last(actionsBuffer);
        lastBuffered.patches.push(patch);
    });


    const debouncedLogActions = debounce(() => {
        instance.logActions(actionsBuffer);
        actionsBuffer = [];
    }, 50);

    addMiddleware(store, (action, next) => {
        if (instance.isActionLogDisabled)
            return next(action);


        if (instance.isTimeTraveling) {
            // TODO
            console.info('actions disabled on time traveling');
            return;
        }

        actionsBuffer.push({
            action: action,
            patches: []
        });

        debouncedLogActions(); // debouncing to optimize very close incoming action logs

        return next(action)
    });


    return instance;
};

export default createStateTreeModel


/* ------------------------------ Private functions ------------------------------ */


/**
 * Updates the action future flag based on the current action
 */
function updateFutureFlag(treeModel) {
    let found = false;
    forEach(treeModel.actionLog, (actionItem) => {
        actionItem.future = found;
        if (actionItem === treeModel.currentAction) {
            found = true;
        }
    });
}


/**
 * Applies the actions on both prev and current state
 * @param instance the StateTreeModel instance
 * @param lastActionId the last action id
 */
function applyCalculatedState(instance, lastActionId) {

    // disable action log
    instance.isActionLogDisabled = true;

    applySnapshot(instance.stateB, instance.initialSnapshot);

    let actionLogIndex = findIndex(instance.actionLog, { id: lastActionId });
    if (actionLogIndex === 0) {
        applySnapshot(instance.stateA, instance.initialSnapshot);
        instance.isActionLogDisabled = false;
        return;
    }


    for (let i=1; i<=actionLogIndex; ++i) {

        if (i === actionLogIndex) {
            applySnapshot(instance.stateA, getSnapshot(instance.stateB));
        }

        // skip action if skip flag = true
        if (instance.actionLog[i].skip) {
            continue;
        }

        let action = instance.actionLog[i].action,
            targetPath = instance.actionLog[i].targetPath,
            targetNode = resolvePath(instance.stateB, targetPath);

        applyAction(targetNode, action);


    }

    // re-enable action log
    instance.isActionLogDisabled = false;
}

/**
 * Applies actions to the specified state tree, until the specified action
 * @param {MobxStateTree} stateTree the tree
 * @param {string} lastActionId - the last action id
 * @param {boolean} includeLastOne - if true, includes the action specified with actionId, otherwise not
 */
function applyActionsUntil(instance, stateTree, lastActionId, includeLastOne = true) {

    applySnapshot(stateTree, instance.initialSnapshot);

    let actionLogIndex = findIndex(instance.actionLog, { id: lastActionId });
    if (actionLogIndex === 0) {
        return;
    }

    if (!includeLastOne && actionLogIndex !== 0) {
        actionLogIndex -= 1;
    }

    for (let i=1; i<=actionLogIndex; ++i) {

        // skip action if skip flag = true
        if (instance.actionLog[i].skip) {
            continue;
        }

        let action = instance.actionLog[i].action,
            targetPath = instance.actionLog[i].targetPath,
            targetNode = resolvePath(stateTree, targetPath);

        applyAction(targetNode, action);

        if (includeLastOne && action.id === lastActionId) {
            break;
        }
    }
}