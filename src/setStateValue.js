import clone from './clone.js';

/**
 * Recursively walk the given state along stateProperty to set the given value
 */
const setStateValue = function (state, stateProperty, value) {

    return loopThroughPropPath(state, stateProperty.split('.'), value);
}

const loopThroughPropPath = function(statePart, stateProperty, value) {
    const property = stateProperty[0];
    if (stateProperty.length > 1) {
        stateProperty.shift();
        statePart[property] = loopThroughPropPath(statePart[property], stateProperty, value);
    } else {
        statePart[property] = clone(value)
    }

    return statePart;
}

export default setStateValue;
