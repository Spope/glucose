module.exports = function() {

    const promise = new Promise((resolve, reject) => {

        console.log('--------');
        console.log('state.js');

        const {parseHTML} = require('linkedom');

        const {document, customElements, HTMLElement, window} = parseHTML('<html />');

        const items = [];

        globalThis = window;
        globalThis.document = document;
        globalThis.customElements = customElements;
        globalThis.HTMLElement = HTMLElement;

        const {createState} = require('../build/index.cjs.js');


        let testState = createState('state', {
            initialState: {
                topLevel: {
                    secondLevel: {
                        prop1: "Hello",
                        prop2: "Hi"
                    }
                }
            },

            actions: {
                test(value) {
                    this.setState({
                        'topLevel.secondLevel.prop1': value
                    });
                }
            }
        });

        let callbackCalled = false;
        const unsubscribe = testState.subscribe('topLevel.secondLevel.prop1', (oldValue, newValue) => {
            console.assert(oldValue === 'Hello', 'State callback old value');
            console.assert(newValue === 'Bonjour', 'State callback new value');
            callbackCalled = true;
        });

        // Callback is set into state subscribers
        console.assert(Object.keys(testState.subscribers).length === 1, 'State subscribers is set');
        console.assert(testState.subscribedPaths[0] === 'topLevel.secondLevel.prop1', 'State subscribedPaths is set');

        // Execute action
        testState.actions.test('Bonjour');
        console.assert(callbackCalled, 'State callback was called');

        // Removing state subscribers
        unsubscribe();
        console.assert(Object.keys(testState.subscribers).length === 0, 'State subscribers is empty');
        console.assert(testState.subscribedPaths.length === 0, 'State subscribedPaths is empty');


        window.setTimeout(() => {
            console.log('> Done');
            console.log('--------');
            console.log('');

            resolve();
        });
    });

    return promise;
};
