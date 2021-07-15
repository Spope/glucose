const cloneArray = function(source) {
    const keys = Object.keys(source);
    const dest = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];
        let value = source[k];
        if (typeof value !== 'object' || value === null) {
            dest[k] = value;
        } else if (value instanceof Date) {
            dest[k] = new Date(value);
        } else {
            dest[k] = clone(value);
        }
    }

    return dest;
}

const clone = function(source) {
    if (typeof source !== 'object' || source === null) return source;
    if (source instanceof Date) return new Date(source);
    if (Array.isArray(source)) return cloneArray(source);
    let dest = Object.create(null);
    for (let k in source) {
        if (Object.hasOwnProperty.call(source, k) === false) continue;
        var value = source[k];
        if (typeof value !== 'object' || value === null) {
            dest[k] = value;
        } else if (value instanceof Date) {
            dest[k] = new Date(value);
        } else {
            dest[k] = clone(value);
        }
    }

    return dest
}

export default clone;
