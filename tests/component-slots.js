module.exports = function() {

    const promise = new Promise((resolve, reject) => {

        console.log('------------');
        console.log('component-slots.js');

        const {parseHTML} = require('linkedom');

        const {document, customElements, HTMLElement, window} = parseHTML(`
          <!doctype html>
              <html lang="en">
                <head>
                  <title>Hello SSR</title>
                </head>
                <body>
                  <component-slots>
                    <div slot="second">Second slot</div>
                    <div slot="first">First slot</div>
                  </component-slots>
                </body>
              </html>
            `);

        const items = [];

        globalThis = window;
        globalThis.document = document;
        globalThis.customElements = customElements;
        globalThis.HTMLElement = HTMLElement;

        const {createComponent, html, render} = require('../build/index.cjs.js');

        createComponent('component-slots', {
            render() {
                return html`
                    <div>${this.slots.first}</div>
                    <div>${this.slots.second}</div>
                `;
            }
        });

        // Render initial state
        //render(document.body, html`
            //<component-slots>
                //<div slot="second">Second slot</div>
                //<div slot="first">First slot</div>
            //</component-slots>
        //`);

        document.body.querySelector('component-slots').connectedCallback();
        const firstSlot = document.body.querySelector('component-slots').innerHTML.indexOf('First slot');
        console.assert(firstSlot !== -1, 'Name slots is appended');

        const secondSlot = document.body.querySelector('component-slots').innerHTML.indexOf('Second slot');
        console.assert(secondSlot !== -1, 'Second slot is appended');

        console.assert(firstSlot < secondSlot, 'Slots are correctly placed (Not working in Node env)');

        window.setTimeout(() => {
            console.log('> Done');
            console.log('------------');
            console.log('');

            resolve();
        });
    });

    return promise;
};
