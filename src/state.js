import clone from './clone.js';
import getStateValue from './getStateValue.js';
import setStateValue from './setStateValue.js';
import getStatePersist from './statePersist.js';

const states = {};

class State {
    constructor(options) {
        if (options.name === undefined) {
            throw new Error('State name is required');
        }
        this.name    = options.name;
        this.persist = null;

        let stateFromPersist;
        if (options.persist) {
            this.persist = getStatePersist(options.persist);
            stateFromPersist = this.persist.loadState(this.name);
        }

        if (stateFromPersist !== undefined) {
            this.state = stateFromPersist;
        } else {
            if (options.initialState) {
                this.state = Object.assign(Object.create(null), clone(options.initialState));
            } else {
                this.state = Object.create(null);
            }
        }
        if (options.actions !== undefined) {
            this.actions = {};
            const actionKeys = Object.keys(options.actions);
            if (actionKeys.length > 0) {
                actionKeys.forEach(key => {
                    if (typeof options.actions[key] === 'function') {
                        this.actions[key] = options.actions[key].bind(this);
                    }
                })
            }
        }

        this.subscribers     = {};
        this.subscribedPaths = [];
    }

    /**
     * Subscribe a callback to a state property change
     * @param {String} path The property to "listen" eg "test.property"
     * @param {Function} cb The callback called on property change
     * @return {Function} unsubscribe function
     */
    subscribe (path, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Invalid subscriber callback')
        }

        // create an unsubscribe function
        const unsubscribe = () => {
            this.subscribers[path] = this.subscribers[path].filter(c => c !== callback)
            if (this.subscribers[path].length == 0) delete this.subscribers[path];
            this.subscribedPaths = Object.keys(this.subscribers);
        }

        this.subscribers[path] = this.subscribers[path] ?? [];
        this.subscribers[path].push(callback);
        this.subscribedPaths = Object.keys(this.subscribers);

        return unsubscribe
    }

    /**
     * Set state values.
     * Will call subscribed callbacks registered for the properties updated.
     * If the property "test.property" is subscribed and the whole "test" object is passed,
     * the callback will correctly be called.
     *
     * @param {Object} newState Key value object
     */
    setState (newState) {
        //console.log('%csetState%c : ', 'color: #60a3bc', 'color: black', newState);
        //console.log(`%cDispatch%c : '%c${type}%c' Payload : `, 'color: #38ada9', 'color: black', 'font-weight: bold', 'font-weight: normal', payload);
        const regeExSubscribedProperties = this.subscribedPaths.map(subscribedProperty => {
            return {
                regEx: new RegExp('^' + subscribedProperty.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
                key: subscribedProperty
            };
        });

        for (const property in newState) {
            const oldValue = getStateValue(this.state, property);
            const newValue = clone(newState[property]);

            if (oldValue === newValue) continue;

            this.state     = setStateValue(this.state, property, newValue);

            // Find subscribers by property
            // If a subscriber listen to a nested property, mutating the owning object will call the subscriber
            const regExProperty = new RegExp('^' + property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const keys          = this.subscribedPaths.filter(name => regExProperty.test(name));

            if (keys.length > 0) {
                // Trigger state listeners
                keys.map(key => {
                    this.subscribers[key].map((subscribedCallback) => {
                        subscribedCallback(oldValue, newValue, false);
                    });
                })
            }

            // Match property by subscriber
            // If a subscriber listen to a owning object, mutating a nested property will call the subscriber
            /*
            const nestedKeys    = [];
            regeExSubscribedProperties.forEach(regExSubscribedProperty => {
                if (
                    regExSubscribedProperty.regEx.test(property)
                    && nestedKeys.indexOf(regExSubscribedProperty.key) === -1
                    && keys.indexOf(regExSubscribedProperty.key) === -1
                ) {
                    nestedKeys.push(regExSubscribedProperty.key);
                }
            })

            if (nestedKeys.length > 0) {
                // Trigger state listeners
                nestedKeys.map(key => {
                    this.subscribers[key].map((subscribedCallback) => {
                        subscribedCallback(oldValue, newValue, property);
                    });
                })
            }
            */
        }

        if (this.persist) {
            this.persist.saveState(this.name, this.state);
        }
    }

    /**
     * Acces a state property, return a clone
     */
    getState (stateProperty) {
        return clone(getStateValue(this.state, stateProperty));
    }
}

const createState = function(name, options) {
    let state = getAppState(name);
    if (state) return state;

    options.name = name;
    state = new State(options);
    states[name] = state;

    return state;
}

const getAppState = function(name) {
    return states[name];
}

const deleteState = function(name) {
    if (states[name]) delete states[name];
}

export {createState, getAppState, deleteState};
