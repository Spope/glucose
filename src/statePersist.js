class BrowserStoragePersistor
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

const getStatePersist = function(persistType) {

    if (typeof persistType === 'object') {
        if (
            typeof persistType.saveState !== 'function'
         || typeof persistType.loadState !== 'function'
         || typeof persistType.removeState !== 'function'
        ) {
            console.error('Custom State persitence class is invalid');
        }

        return persistType;
    }


    const authorizedTypes = ['localStorage', 'sessionStorage'];
    if (authorizedTypes.indexOf(persistType) === -1) {
        console.error('Bad StatePersist type, available types are ' + authorizedTypes.join(', '))
    }

    if (!persistors[persistType]) {

        let storage;
        if (persistType === 'localStorage') {
            storage = globalThis.localStorage;
        } else {
            storage = globalThis.sessionStorage;
        }

        persistors[persistType] = new BrowserStoragePersistor(storage);
    }

    return persistors[persistType];
}

export default getStatePersist;
