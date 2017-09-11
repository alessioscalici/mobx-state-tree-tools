
import { intersection, keys, difference, forEach, isEqual, isObject, isEmpty } from 'lodash'

export function internalDiff(a, b) {
    var res = {};
    var intersectionSet = intersection(
        keys(a), keys(b)
    );
    var keysA = difference(keys(a), intersectionSet);
    var keysB = difference(keys(b), intersectionSet);

    forEach(keysA, function(k) {
        res[k] = {
            op: 'remove',
            oldValue: a[k],
            newValue: undefined,
            name: k
        };

    });
    forEach(keysB, function(k) {
        res[k] = {
            op: 'add',
            oldValue: undefined,
            newValue: b[k],
            name: k
        };
    });

    forEach(intersectionSet, function(k) {
        if (!isEqual(a[k], b[k])) {
            res[k] = {
                op: 'change',
                oldValue: a[k],
                newValue: b[k],
                name: k
            };
            if (isObject(a[k]) && isObject(b[k])) {
                res[k].diff = internalDiff(a[k], b[k]);
            }
        }
    });

    return res;
}

export function diff (a, b) {
    let res = internalDiff(a, b);
    if (!isEmpty(res)) {
        return {
            diff: res,
            op: 'change',
            oldValue: a,
            newValue: b
        }
    }
    return res;
}
