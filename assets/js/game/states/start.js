app.options.states.push({
    label: 'state-start',
    actions: {
        preload: preloadStateStart,
        create: createStateStart,
        update: updateStateStart,
        render: renderStateStart
    }
});


// --------------------------------------------------
// state actions
// --------------------------------------------------

function preloadStateStart() {
    // scale whole game
    app.helpers.scaleGame();
    // load all sprites from table
    // remember: only need to preload images once
    app.data.sprites.forEach(function (item) {
        app.game.load.image(item.type + '-' + item.slug, app.options.imagePath + item.path + item.slug + '.' + item.extension);
    });
}

function createStateStart() {
    // print info
    console.info('state: start');
    // add background
    app.game.add.sprite(0, 0, 'background-swamp');
}

function updateStateStart() {
    //
}

function renderStateStart() {
    //
}
