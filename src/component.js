import clone from './clone.js';
import getStateValue from './getStateValue.js';
import setStateValue from './setStateValue.js';
import {addToRefreshList, removeFromRefreshList} from './componentRefreshList.js';
import {getAppState} from './state.js';
import {render} from './uhtml.js';

let id = 0;

const reservedProps = [
    // Glucose
    'mappedProperties',
    // CustomElement
    'constructor',
    'observedAttributes',
    'connectedCallback',
    'disconnectedCallback',
    'adoptedCallback',
    'attributeChangedCallback'
];

const createComponent = function(name, props) {

    class Component extends HTMLElement {
        _gId;
        _state;

        constructor() {
            super();

            //Unique Glucose Id for each component
            this._gId = id++;
            this._setRoot();
            this._setSlots();

            this._callLifecycleCallback('initialized');
        }

        ////////////////
        //Config methods
        ////////////////
        get observedAttributes() {
            if (typeof props.observedAttributes == 'function') {
                return props.observedAttributes.call(this);
            }
            return null;
        }
        // Properties mapped to global state.
        // Properties here will be read from global state.
        get mappedProperties() {
            if (typeof props.mappedProperties == 'function') {
                return props.mappedProperties.call(this);
            }
            return null;
        }

        ///////////////////////////
        //Element lifecycle methods
        ///////////////////////////
        connectedCallback() {
            this._initComponentState();
            this._bindStates();
            this._renderComponent();

            this._callLifecycleCallback('connectedCallback');
        }
        disconnectedCallback() {
            this._callLifecycleCallback('disconnectedCallback');

            // Unbind mappedPoperties form global state.
            this.unsubscribeFromState.forEach(unsubscribe => unsubscribe());
            // if component is in refreshList removeIt.
            removeFromRefreshList(this._gId);

        }
        attributeChangedCallback(name, oldValue, newValue) {
            this._askRender();

            this._callLifecycleCallback('attributeChangedCallback');
        }

        ///////////////////
        //Component methods
        ///////////////////

        // Read property from state.
        getState(property, stateName) {
            if (stateName) {
                const state = getAppState(stateName);
                if (state === undefined) return null;
                return getStateValue(state.state, property);
            }

            return getStateValue(this._state, property);
        }
        // Set state values.
        // Will render the component.
        setState(newState) {
            for (const property in newState) {
                this._state = setStateValue(this._state, property, newState[property]);
            }
            this._askRender();
        }

        dispatch(type, data, options) {
            const baseOptions = {
                bubbles: true,
                cancelable: true,
                composed: false
            }
            const eventOptions = Object.assign({}, baseOptions, options)

            const event = globalThis.document.createEvent( 'CustomEvent' );
            event.initCustomEvent(type,
                eventOptions.bubbles,
                eventOptions.cancelable,
                eventOptions.detail
            );
            this.dispatchEvent(event);
        }

        /////////////////
        //Private methods
        /////////////////

        // Setup local state
        _initComponentState() {
            let localState = props.initialState;
            if (localState == null) localState = Object.create(null);
            this._state = Object.assign(Object.create(null), localState);
        }
        // Bind mappedProperties to global state.
        // If one of these is updated, component will be added into ComponentRefreshList
        _bindStates() {
            this.unsubscribeFromState = [];
            const binding = this.mappedProperties;
            for (const stateName in binding) {
                const state = getAppState(stateName);
                if (state === undefined) throw new Error(`State ${stateName} not found`);
                binding[stateName].forEach(path => {
                    this.unsubscribeFromState.push(state.subscribe(path, (oldValue, newValue) => this._askRender(oldValue, newValue)));
                });
            }
        }
        // Used to extends CustomElmenet lyfecycle
        _callLifecycleCallback(type) {
            if (typeof props[type] == 'function') {
                props[type].call(this);
            }
        }
        // Ask component to be re-rendered on next animation frame
        _askRender(oldValue, newValue) {
            addToRefreshList(this._gId, () => this._renderComponent());
        }
        _renderComponent() {
            render(this._root, this.render.call(this));

            this._callLifecycleCallback('renderCallback');
        }
        _setRoot() {
            switch (props.root) {
                case 'open':
                    this._root = this.attachShadow({mode: 'open'});
                break;
                case 'closed':
                    this._root = this.attachShadow({mode: 'closed'});
                break;
                default:
                    this._root = this;
                break;
            }
        }
        _setSlots() {
            const children = this.childNodes;
            this.slots = {
                default: []
            };

            if (children.length > 0) {
                [...children].forEach(child => {
                    let name = 'default';
                    if (child.getAttribute && child.getAttribute('slot')) {
                        name = child.getAttribute('slot');
                        this.slots[name] = child;
                    } else {
                        this.slots.default.push(child);
                    }
                })
            }
        }
    }

    for (const key in props) {
        if (reservedProps.indexOf(key) !== -1) continue;

        if (!Component[key] && typeof props[key] === 'function') {
            Component.prototype[key] = props[key];
        }
    }

    globalThis.customElements.define(name, Component);
}

export default createComponent;
