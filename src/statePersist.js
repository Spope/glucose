class StatePersist
{
    constructor(storage) {
        this.storage = storage;
    }

    saveState(name, state) {
        this.storage.setItem(`${name}:state`, typeof state === 'string' ? state : JSON.stringify(state))

        return true;
    }

    loadState(name) {
        const state = this.storage.getItem(`${name}:state`)

        return state ? JSON.parse(state) : undefined;
    }

    removeState(name) {
        this.storage.removeItem(`${name}:state`)
    }
}

const persistors = {};

const getStatePersist = function(type) {

    if (['localStorage', 'sessionStorage'].indexOf(type) === -1) {
        console.error('Bad StatePersist type')
    }

    if (!persistors[type]) {

        let storage;
        if (type === 'localStorage') {
            storage = globalThis.localStorage;
        } else {
            storage = globalThis.sessionStorage;
        }

        persistors[type] = new StatePersist(storage);
    }

    return persistors[type];
}

export default getStatePersist;
