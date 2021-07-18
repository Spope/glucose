module.exports = function() {

    const promise = new Promise((resolve, reject) => {

        console.log('----------------------');
        console.log('component-app-state.js');

        const {parseHTML} = require('linkedom');

        const {document, customElements, HTMLElement, window} = parseHTML('<html />');

        const items = [];

        globalThis = window;
        globalThis.document = document;
        globalThis.customElements = customElements;
        globalThis.HTMLElement = HTMLElement;

        const {createComponent, html, createState} = require('../build/index.cjs.js');

        const testState = createState('component-app-state', {
            initialState: {
                topLevel: {
                    secondLevel: {
                        prop1: "you",
                        prop2: "handsome"
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


        createComponent('component-app-state', {
            stateProperties() {
                return {
                    'component-app-state': ['topLevel.secondLevel.prop1']
                }
            },
            changeState() {
                testState.actions.test('me');
            },
            render() {
                return html`<p>Hello ${this.getState('topLevel.secondLevel.prop1', 'component-app-state')}<p><button onclick=${e => this.changeState(e)}>Click</button>`;
            }
        });

        // Render initial sate
        const component1 = document.createElement('component-app-state');
        component1.connectedCallback();
        console.assert(component1.innerHTML.indexOf('Hello you') !== -1, 'Initial app state is rendered');

        // Update state from action
        let button = component1.querySelector('button').dispatchEvent(new Event('click'));
        window.setTimeout(() => {
            console.assert(component1.innerHTML.indexOf('Hello me') !== -1, 'Initial app state is changed');
        });


        window.setTimeout(() => {
            console.log('> Done');
            console.log('----------------------');
            console.log('');

            resolve();
        });
    });

    return promise;
}
