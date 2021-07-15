const getStateValue = function(state, stateProperty) {

    if (state == null || state == undefined) {
        return state;
    }

    stateProperty = stateProperty.split('.');

    let ret = state;

    stateProperty.every(property => {
        ret = ret[property];
        return ret !== undefined && ret !== null;
    });

    return ret;
}

export default getStateValue;
