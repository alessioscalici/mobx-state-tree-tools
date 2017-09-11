import React from 'react'
import { isString, isNull, isUndefined, isNumber, isNaN, isBoolean, isDate, isRegExp } from 'lodash'

import './ObjectTree.css'


export default ({ value }) => {
    let stringValue = value + '';
    if (isString(value)) {
        return <span>"<span className="string-value">{stringValue}</span>"</span>
    }
    if (isNull(value) || isUndefined(value)) {
        return <span className="null-value">{stringValue}</span>
    }
    if (isNaN(value) || isNumber(value) || isBoolean(value)) {
        return <span className="literal-value">{stringValue}</span>
    }
    if (isDate(value)) {
        return <span>{value.toString()}</span>
    }
    if (isRegExp(value)) {
        return <span className="string-value">{stringValue}</span>
    }

    // default
    return <span>{stringValue}</span>

}