module.exports = function() {

    const promise = new Promise((resolve, reject) => {

        console.log('------------');
        console.log('component.js');

        const {parseHTML} = require('linkedom');

        const {document, customElements, HTMLElement, window} = parseHTML('<html />');

        const items = [];

        globalThis = window;
        globalThis.document = document;
        globalThis.customElements = customElements;
        globalThis.HTMLElement = HTMLElement;

        const {createComponent, html} = require('../build/index.cjs.js');

        let renderedCallbackCall = 0;

        createComponent('component-test', {
            initialState: {
                'name': 'Toto'
            },
            observedAttributes() {
                return [
                    'test'
                ]
            },
            changeState() {
                this.setState({name: 'Tata'});
            },
            renderedCallback() {
                renderedCallbackCall++;
            },
            render() {
                return html`
                    <p>Hello ${this.getState('name')}<p><button onclick=${e => this.changeState(e)}>Click</button>
                    <p>Attr : ${this.getAttribute('test')}</p>
                `;
            }
        });

        // Render initial state
        const component1 = document.createElement('component-test');
        component1.connectedCallback();
        console.assert(component1.innerHTML.indexOf('Hello Toto') !== -1, 'Initial state is rendered');

        // Render state update
        let button = component1.querySelector('button').dispatchEvent(new Event('click'));
        setTimeout(() => {
            console.assert(component1.innerHTML.indexOf('Hello Tata') !== -1, 'Initial state is changed');
        });

        // Render prop update + renderedCallback
        component1.setAttribute('test', 'Great');
        setTimeout(() => {
            console.assert(component1.innerHTML.indexOf('Attr : Great') !== -1, 'Attributes are working');
            console.assert(renderedCallbackCall === 2, 'Render callback is called');
        });


        window.setTimeout(() => {
            console.log('> Done');
            console.log('------------');
            console.log('');

            resolve();
        });
    });

    return promise;
};
