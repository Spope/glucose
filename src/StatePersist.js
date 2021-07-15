import clone from '../clone.js';

class StatePersist
{
    constructor(type) {
        if (type === 'localStorage') {
            this.storage = globalThis.localStorage;
        } else {
            this.storage = globalThis.sessionStorage;
        }
    }

    async saveState(name, state) {
        this.storage.setItem(`${name}:state`, typeof state === 'string' ? state : JSON.stringify(state))

        return true;
    }

    async loadState(name) {
        const state = this.storage.getItem(`${name}:state`)

        return state ? JSON.parse(state) : undefined
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
        persistors[type] = new StatePersist(type);
    }

    return persistors[type];
}

export default getStatePersist;
