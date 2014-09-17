app.options.states.push({
    label: 'state-end',
    actions: {
        preload: preloadStateEnd,
        create: createStateEnd,
        update: updateStateEnd,
        render: renderStateEnd
    }
});


// --------------------------------------------------
// state actions
// --------------------------------------------------

function preloadStateEnd() {
    //
}

function createStateEnd() {
    console.info('state: end');
}

function updateStateEnd() {
    //
}

function renderStateEnd() {
    //
}
