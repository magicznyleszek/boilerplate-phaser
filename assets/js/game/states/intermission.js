app.options.states.push({
    label: 'state-intermission',
    actions: {
        preload: preloadStateIntermission,
        create: createStateIntermission,
        update: updateStateIntermission,
        render: renderStateIntermission
    }
});


// --------------------------------------------------
// state actions
// --------------------------------------------------

function preloadStateIntermission() {
    //
}

function createStateIntermission() {
    console.info('state: intermission');
}

function updateStateIntermission() {
    //
}

function renderStateIntermission() {
    //
}
