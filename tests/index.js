async function execute() {
    const component = require('./component.js');
    await component();
    delete component;

    const componentAppState = require('./component-app-state.js');
    await componentAppState();
    delete componentAppState;

    // Not working in node env
    const componentSlots = require('./component-slots.js');
    await componentSlots();
    delete componentSlots;

    const state = require('./state.js');
    await state();
    delete state;
}

execute();
