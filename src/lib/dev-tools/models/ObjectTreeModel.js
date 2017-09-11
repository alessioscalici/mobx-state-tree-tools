
import { types } from 'mobx-state-tree'
import { values, indexOf, forEach, isObject, last, get, pull, filter } from 'lodash'

import ObjectTreeViewEnum from './ObjectTreeViewEnum.js'



const ObjectTreeModel = types.model('ObjectTree',
    {
        name: types.optional(types.string, ''),
        searchFilter: types.optional(types.string, ''),
        selectedNodes: types.optional(types.array(types.string), []), // FIXME make calculated
        explodedNodes: types.optional(types.array(types.string), ['']), // root node exploded by default
        pinPath: types.optional(types.string, ''), // root node pinned by default
        treeView: types.optional(
            types.union(...values(ObjectTreeViewEnum).map(types.literal)),
            ObjectTreeViewEnum.TREE_VIEW
        ),
        showPin: types.optional(types.boolean, true), // shows/hides pin icon and breadcrumbs
        showFilter: types.optional(types.boolean, true), // shows/hides filter
        showViewSelector: types.optional(types.boolean, true), // shows/hides view selector (tree/raw)

        get pinnedNode() {
            return this.pinPath ? get(this.store, this.pinPath) : this.store;
        },

        get pinnedName() {
            return this.pinPath ? last(this.pinPath.split('.')) : this.name;
        },

        get breadcrumbs() {
            let splitted = this.pinPath.split('.'),
                acc = [],
                breadcrumbs = [];
            breadcrumbs.push({
                text: this.name,
                path: ''
            });
            forEach(splitted, (text) => {
                if (!text) {
                    return;
                }
                acc.push(text);
                breadcrumbs.push({
                    text: text,
                    path: acc.join('.')
                });
            });
            return breadcrumbs;
        },

        isPathExploded(path) {
            return indexOf(this.explodedNodes, path || '' ) !== -1;
        },

        isPathFiltered(path) {
            return !!this.searchFilter && this.selectedNodes.indexOf(path) === -1;
        }
    },
    {
        store: () => null
    },
    {

        setSearchFilter(filter) {
            this.searchFilter = filter;

            // update selected paths
            this.selectedNodes = getSelectedPaths(this.store, '', filter); // FIXME filtered view

            // set/unset filter preview
            if (filter) {
                this.treeView = ObjectTreeViewEnum.FILTERED_VIEW;
            } else {
                this.treeView = ObjectTreeViewEnum.TREE_VIEW;
            }
        },
        pinNode(path) {
            this.pinPath = path;
        },
        explodeNode(path = '') {
            this.explodedNodes.push(path);
        },
        collapseNode(path = '') {
            pull(this.explodedNodes, path);
        },
        explodeAllChildren(path = '') {
            let root = this.store;
            if (path) {
                root = get(root, path);
            }
            this.explodedNodes = this.explodedNodes.concat(getAllPaths(root, path));
        },
        collapseAllChildren(path) {
            if (path) {
                this.explodedNodes = filter(this.explodedNodes, (nodePath) => {
                    return nodePath.substring(0, path.length) !== path;
                });
            } else {
                this.explodedNodes = []; // collapse all
            }
        },


        explodePath(path, exclusive = true) {
            let paths = getAncestorPaths(path);
            if (exclusive) {
                this.collapseAllChildren();
            }
            forEach(paths, this.explodeNode);
        },

        setTreeView(view) {  // one of tree, raw, filter
            this.treeView = view
        },

        setObject(object) {
            this.store = object;
        }
    });




export default ObjectTreeModel


/* ------------------------------ Private functions ------------------------------ */

function getAllPaths(object = {}, path = '') {
    let result = [];

    forEach(object, (v, k) => {
        let childPath = path+'' ? path + '.' + k : k+'';
        if (isObject(v)) {
            let res = getAllPaths(v, childPath);
            result = result.concat(res);

        } else {
            result.push(childPath);
        }
    });

    result.push(path);

    return result;
}

function getAncestorPaths(path = '', includeLast = true) {
    let splitted = path.split('.');

    if (!includeLast) {
        splitted.splice(-1); // remove last
    }

    let result = [''], acc = '';
    forEach(splitted, (v) => {
        acc = acc ? acc + '.' + v : ''+v;
        result.push(acc);
    });
    return result;
}


/**
 * Returns the paths that are selected by the given filter
 * @param {object} object The object to search for paths
 * @param {string} path The current path
 * @param {string} filter The search filter
 * @returns {{paths: Array, allFiltered: boolean}}
 */
function getSelectedPaths(object = {}, path = '', filter = '') {
    let result = [];

    forEach(object, (v, k) => {
        let childPath = path+'' ? path + '.' + k : k+'';
        k = k+'';
        if (isObject(v)) {
            let res = getSelectedPaths(v, childPath, filter);
            result = result.concat(res);
        }
        let term = filter.indexOf('.') === -1 ? k+'' : childPath;
        if (term.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
            result.push(childPath);
        }
    });

    return result;
}
