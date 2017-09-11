
import { types, isStateTreeNode, getSnapshot } from 'mobx-state-tree'
import { get } from 'lodash'

import ObjectTreeModel from './ObjectTreeModel.js'

import { diff as objectDiff } from '../Utils.js'

const ObjectDiffTreeModel = types.compose('ObjectDiffTree', ObjectTreeModel,
    {


        showOnlyChanged: types.optional(types.boolean, false),
        showDiff: types.optional(types.boolean, true),

        get pinnedOldNode() {
            return this.pinPath ? get(this.oldObject, this.pinPath) : this.oldObject;
        },
        get pinnedDiffNode() {
            let path = this.pinPath.split('.').join('.diff.');
            return path ? get(this.diff, 'diff.' + path) : this.diff;
        },

        get diff() {
            // FIXME remove mobx special diff
            if (isStateTreeNode(this.oldObject) && isStateTreeNode(this.store)) {
                return objectDiff(getSnapshot(this.oldObject), getSnapshot(this.store));
            }
            return  {};
        },

        getDiffNode(path) {
            let diffPath = path.split('.').join('.diff.');
            return path ? get(this.diff, 'diff.' + diffPath) : this.diff;
        }

    },
    {
        oldObject: null
    },
    {
        setOldObject(object) {
            this.oldObject = object;
        }

    });




export default ObjectDiffTreeModel


/* ------------------------------ Private functions ------------------------------ */