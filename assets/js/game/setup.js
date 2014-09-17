var app = {
    // basic options
    options: {
        canvasWidth: 1024,
        canvasHeight: 768,
        container: document.querySelector('#game'),
        debug: true,
        imagePath: 'assets/img/game/',
        states: []
    },
    status: {
        stage: 1,
        points: 0
    },
    data: {},
    game: undefined,
    helpers: {},
    run: function () {
        var a;
        // initialize game
        app.game = new Phaser.Game(app.options.canvasWidth, app.options.canvasHeight, Phaser.CANVAS, app.options.container);
        // setup game states
        for (a = 0; a < app.options.states.length; a += 1) {
            app.game.state.add(app.options.states[a].label, app.options.states[a].actions, false);
        }
        // run first state
        app.game.state.start(app.options.states[0].label, true, true);
    }
};
