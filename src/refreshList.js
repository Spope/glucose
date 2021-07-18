// List of component to update
let list         = {};
let refreshAsked = false;

// In node context
let doLater = setTimeout;
if (typeof globalThis.requestAnimationFrame == 'function') {
    // In browser
    doLater = globalThis.requestAnimationFrame;
}

// On each state modification, will add components to update list
// and actually re-render them on the next frame.
const addToRefreshList = function(gId, renderComponent) {
    // Set component render cb into an object.
    list[gId] = renderComponent;

    if (refreshAsked === false) {
        // Ask a refresh on next frame if not already asked
        doLater(refreshComponents);
        refreshAsked = true;
    }
}

// Actual re-render of components
const refreshComponents = function() {
    for (let i in list) {
        list[i]();
    }

    list         = {};
    refreshAsked = false;
}

const removeFromRefreshList = function(gId) {
    if (list[gId] === undefined) return;

    delete list[gId];
}

export {addToRefreshList, removeFromRefreshList};
