app.options.states.push({
    label: 'state-gameplay',
    actions: {
        preload: preloadStateGameplay,
        create: createStateGameplay,
        update: updateStateGameplay,
        render: renderStateGameplay
    }
});


// --------------------------------------------------
// state actions
// --------------------------------------------------

function preloadStateGameplay() {
    //
}

function createStateGameplay() {
    console.info('state: gameplay');
    // create place from library
    app.helpers.createStage(stage, false);
    // clear timers
    // and add loop for timer
    app.game.time.events.events = [];
    app.game.time.events.loop(Phaser.Timer.SECOND, app.helpers.updateTime, this);
    // keep the game running when browser loose focus
    app.game.stage.disableVisibilityChange = true;
}

function updateStateGameplay() {
    // check for the game end
    checkGoal();
}

function renderStateGameplay() {
    if (debugMode) {
        //
    }
}
