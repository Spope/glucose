## Components

Register a custom element :

```javascript
import {createComponent, createState, html} from '../build/index.esm.js';

createComponent('test-component', {
    render() {
        return html`
            This is the content.
        `;
    }
});
```
Usage :

```html
<test-component></test-component>
```

### Components lyfecycle callback :

    * constructor
    * observedAttributes
    * connectedCallback
    * disconnectedCallback
    * adoptedCallback
    * attributeChangedCallback
    * renderedCallback


### Observed attributes :

```javascript
    observedAttributes() {
        return [
            'switch-state'
        ];
    }
```

### State properties

#### Subscribe a component to a state property.

See [Subscribe to a state change](#Subscribe to a state change) for subscribing logic.

```javascript
    stateProperties() {
        return {
            'StateName': [
                'property',
                'nested.properties'
            ]
        }
    }
```

#### Reading a state value from a component

```javascript
    this.getState('nested.property', 'StateName');
```

### Local State

```javascript
    initialState: {
        nested: {
            property: "Hi"
        },
        prop: 'Hello',
    }
```

Local state can be updated using `this.setState({propName: 'value'})` method. Updating a state will request a component render on the next frame.


### Dispatch Events from a component
```javascript
this.dispatch('eventName', {data: 'some data'}, opts);
```

Default event options are :
 * bubbles: true,
 * cancelable: true,
 * composed: false

### Component shadow root

```javascript
    root: 'open', // 'closed'
```

### Slots

Slots can be named or retrieved with the 'default' name

```javascript
import {createComponent, createState, html} from '../build/index.esm.js';

createComponent('sloted-component', {
    render() {
        return html`
            <p>Show me some slots :</p>
            <div>
                ${this.slots.first}
                ${this.slots.second}
                ${this.slots.default}
            </div>
        `;
    }
});
```

```html
<sloted-component>
    <div slot="second">World</div>
    <div slot="first">Hello</div>
    <div>!</div>
</sloted-component>
```

### Custom methods

Component can contains custom method used for application logic.

```html
    thisMethodWillBeAvailabelIntoTheComponents() {
        ...
    }
```

## State

### Create a state

```javascript
createState('StateName', {
    initialState: {
        property: [],
        someOtherProp: null
    },
```

The createState method return the state object, which can be used as is or retreived using the `getAppState('name')` method.

### Updating state.

```javascript
state.setState({'nested.props': value, prop: 'Hi'});
```

### Reading a state value

```javascript
state.getState('paht.to.property');
```

### Subscribe to a state change

State update are handled atomically. Components or callback must declare which properties they are listening to. If a callback is subscribed to `"user.name"` property, it will be invoked if `"user.name"` is changed or the whole `"user"` object. The oposite isn't true, if a callback is registerd on the `"user"` object, udpating `"user.name"` will not invoke the callback.

```javascript
const unsubscribe = state.subscribe('listen.to.this.property', cb);
```

### Persisting the state

#### Default persistence

```javascript
    persist: 'local', // session
```

'local' will persist the state into the `localStorage`, 'session' into the `sessionStorage`

#### Custom persistence

You can persit the state anywhere else by providing a custom persisence class :


```javascript
class MyCustomStorage
{
    saveState(stateName, state) {
        // Save the state
    }

    loadState(stateName) {
        // Return state object
    }

    removeState(stateName) {
        // Remove the state
    }
}

// Into the State intialization :
    persist: new MyCustomStorage(),
```
