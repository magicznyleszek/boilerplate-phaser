function DinosaursApp() {

    var selfApp = this;

    // Contents:
    // 1. declarations
    // 2. public game interface
    // 3. helper functions
    // 4. main game states functions


    // -------------------------------------------------------------------------
    // declarations
    // -------------------------------------------------------------------------

    // html stuff
    var container = document.querySelector('#dinosaurs');
    var imgPath = 'assets/img/game/';

    // dinosaurs library
    // every dinosaur has name, slug and category
    var dinosaursLibrary = [
        {
            name: 'Trilobite paradoxides',
            slug: 'trilobite',
            strength: 'water',
        },
        {
            name: 'Deinonychus antirrhopus',
            slug: 'deinonychus',
            strength: 'earth',
        },
        {
            name: 'Pteranodon longiceps',
            slug: 'pteranodon',
            strength: 'air',
        },
    ];

    // sprite library for smarter loading
    var spritesLibrary = [
        { type: 'background', slug: 'swamp', extension: 'png', path: 'backgrounds/'},
    ];

    // populate sprites library with all dinosaurs
    populateSpritesLibrary('dinosaur', dinosaursLibrary, 'png', 'dinosaurs/');

    // stages
    var stage = 1; // starting stage
    var totalStages = 3;

    // stages library to be generated
    var stagesLibrary = generateStages(totalStages);
    // console.log(stagesLibrary);

    // scoring
    var pointsMaximum = 100;
    var pointsMinimum = 5;
    var time = 0; // s
    var timeMaximum = 10; // s
    var timeMinimum = 2; // s

    // the game
    var game = new Phaser.Game(1024, 768, Phaser.CANVAS, container);

    // debug
    var debugMode = true;

    // game states
    var stateStart = {
        preload: preloadStateStart,
        create: createStateStart,
        update: updateStateStart
    };
    var stateGame = {
        preload: preloadStateGame,
        create: createStateGame,
        update: updateStateGame,
        render: renderStateGame
    };
    var stateIntermission = {
        preload: preloadStateIntermission,
        create: createStateIntermission,
        update: updateStateIntermission
    };
    var stateEnd = {
        preload: preloadStateEnd,
        create: createStateEnd,
        update: updateStateEnd
    };

    // adding states to the game and setting the first one
    game.state.add('state-start', stateStart, true);
    game.state.add('state-game', stateGame, false);
    game.state.add('state-intermission', stateIntermission, false);
    game.state.add('state-end', stateEnd, false);


    // -------------------------------------------------------------------------
    // public game interface
    // -------------------------------------------------------------------------

    // because this is not allwas the best answer (can be another local variable)
    var selfApp = this;

    // reset the game state
    this.resetInternals = function () {
        // shuffle the library
        shuffle(stagesLibrary);
        // set initial values
        stage = 1;
        time = 0;
        statsTotalTimeElapsed = 0;
        stagesLibrary = generateStages(totalStages);
        // trigers an event that updates sidebar
        $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: 10}));
    };

    // returns current points
    // this method will be often used to save user points on intermission state
    this.getCurrentPoints = function () {
        // declarations
        var totalPoints = 0;
        var pointsPerSecond;
        stagesLibrary[stage-1].timeTaken = time;
        // check if answered good
        if (stagesLibrary[stage-1].answeredGood) {
            // check if time is under the limit
            // over the limit
            // or count the proportional points value
            if (stagesLibrary[stage-1].timeTaken <= timeMinimum) {
                stagesLibrary[stage-1].points = pointsMaximum / totalStages;
            } else if (stagesLibrary[stage-1].timeTaken >= timeMaximum) {
                stagesLibrary[stage-1].points = pointsMinimum / totalStages;
            } else {
                // count points per second
                pointsPerSecond = (pointsMaximum - pointsMinimum) / (timeMaximum - timeMinimum);
                stagesLibrary[stage-1].points = (pointsMaximum - (stagesLibrary[stage-1].timeTaken - timeMinimum) * pointsPerSecond) / totalStages;
            }
        }
        // count final points
        stagesLibrary.forEach(function (stage) {
            if (isNumber(stage.points)) {
                totalPoints += stage.points;
            }
        });
        // round the value
        totalPoints = Math.round(totalPoints);
        // hardcoded limit, can fake the results, comment it out if you debug points
        if (totalPoints > 100) { totalPoints = 100; }
        // return points
        return totalPoints;
    };

    // go to next stage
    this.goToNextStage = function () {
        // check if next level exists
        if (stage > totalStages || stage === totalStages && stagesLibrary[stage-1].answered) {
            // go to end stage
            game.state.start('state-end', true, true);
        } else {
            // increment stages
            stage ++;
            // reset values
            time = 0; // s
            // update sidebar
            // but only if the stage number makes sense
            if (stage <= totalStages) {
                $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: totalStages}));
            }
            // start new level
            game.state.start('state-game', true, true);
        }
    };


    // -------------------------------------------------------------------------
    // helper functions
    // -------------------------------------------------------------------------

    // check if is number
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Fisher-Yates shuffle algorithm
    function shuffle(array) {
        var m = array.length, t, i;
        // While there remain elements to shuffle
        while (m) {
            // Pick a remaining element
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    // self explanatory
    function populateSpritesLibrary(type, array, extension, path) {
        array.forEach(function (item) {
            spritesLibrary.push({type: type, slug: item.slug, extension: extension, path: path});
        });
    }

    // generate stages
    function generateStages(stages) {
        // declarations
        var allStages = [];
        var dinosaurs = dinosaursLibrary;
        var stageCountries = [];
        var a, b;
        var tempStage = {};
        var clone;
        // shuffle dinosaurs
        shuffle(dinosaurs);
        // loop through all stages
        for (a = 0; a < stages; a += 1) {
            // clear temp stage object
            tempStage = {};
            // use clone to avoid duplicate changes to objects
            console.log(dinosaurs[a]);
            clone = JSON.parse(JSON.stringify(dinosaurs[a]));
            tempStage.dinosaur = clone;
            // add some flags
            tempStage.finished = false;
            // add points counter
            tempStage.points = undefined;
            tempStage.timeTaken = undefined;
            // add temp stage to stages
            allStages.push(tempStage);
        }
        return allStages;
    }

    // generete given flag for answering
    function createFlag(flagIndex, x, y) {
        // declarations
        var flag;
        var checkmark;
        var country = stagesLibrary[stage-1].flags[flagIndex].slug;
        var flagSprite = 'flag-' + country;
        // put the answer flag in place
        flag = game.add.sprite(x, y, flagSprite);
        flag.name = country;
        // if checked add checkmark
        if (stagesLibrary[stage-1].flags[flagIndex].isChecked) {
            // add checkmark to the center of flag
            checkmark = game.add.sprite(x + flag.center.x, y + flag.center.y, 'interface-check');
            checkmark.anchor.setTo(0.5, 0.5);
        }
        // enable input
        // make it pixel perfect
        // and add hand cursor
        flag.inputEnabled = true;
        flag.input.pixelPerfect = true;
        flag.input.useHandCursor = true;
        // add event on tap/click
        // onInputDown is triggered on tap start
        // onInputUp is triggered on tap end
        flag.events.onInputDown.add(function () {
            // check flag
            stagesLibrary[stage-1].flags[flagIndex].isChecked = true;
            // set answer for current stage
            stagesLibrary[stage-1].answeredGood = country === stagesLibrary[stage-1].country.slug;
            stagesLibrary[stage-1].answered = true;
        });
        // add events on hover
        flag.events.onInputOver.add(function () {
            flag.alpha = 0.8;
        });
        flag.events.onInputOut.add(function () {
            // wait for a while to ratate back
            setTimeout(function () {
                flag.alpha = 1;
            }, 50);
        });
        return flag;
    }

    // generate stage board from library in order incremented by stage
    function createStage(stageNumber, hideFlags) {
        // declarations
        var a, b;
        var type = '';
        // create place background
        game.add.sprite(0, 0, 'continent-' + stagesLibrary[stage-1].country.continent);
        // add current and previous countries sprites
        for (b = 0; b < stageNumber; b += 1) {
            // check if current stage
            if (b === stageNumber - 1) {
                // if young kids, give them labeled version
                if (ageRangeDificultyMultiplier === 1) {
                    type = 'blue-';
                } else {
                    type = 'blue-empty-';
                }
            } else {
                // check if answered good
                if (stagesLibrary[b].answeredGood) {
                    type = 'green-';
                } else {
                    type = 'red-';
                }
            }
            // add sprite for country
            game.add.sprite(0,0, type + stagesLibrary[b].country.slug);
        }
        if (!hideFlags) {
            // create flags-answers
            for (a = 0; a < stagesLibrary[stage-1].flags.length; a += 1) {
                createFlag(a, 880, 200 + a * 100);
            }
        }
        // show some info
        console.info('Created board for stage ' + stageNumber + ' of ' + totalStages + '.');
    }

    // game time update
    function updateTime() {
        time += 1;
    }

    // game ending
    function checkGoal() {
        var goalMet = false;
        // check if the stage was answered
        if (stagesLibrary[stage-1].answered) {
            goalMet = true;
            // update sidebar
            $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: totalStages}));
            // go to the intermission between levels
            game.state.start('state-intermission', true, true);
        }
        return goalMet;
    }

    // scale game
    function scaleGame() {
        // game scaling -- set limit
        // and set scale mode to do stuff proportionally
        game.stage.scale.maxWidth = 1024;
        game.stage.scale.maxHeight = 768;
        game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
        // trigger window resize
        window.dispatchEvent(new Event('resize'));
    }


    // -------------------------------------------------------------------------
    // main game states functions
    // -------------------------------------------------------------------------

    function preloadStateStart() {
        // scale whole game
        scaleGame();
        // load all sprites from table
        spritesLibrary.forEach(function (item) {
            game.load.image(item.type + '-' + item.slug, imgPath + item.path + item.slug + '.' + item.extension);
        });
    }

    function createStateStart() {
        console.info('START');
        // This trigger enables the event catcher to take controll over the game
        $(document).trigger('kids-game-initialized', new KidsEventParameterBag({gameApp: selfApp}));
    }

    function updateStateStart() {
    }

    // -------------------------------------------------------------------------

    function preloadStateGame() {
        // only need to preload images once
    }

    function createStateGame() {
        console.info('GAME');
        // create place from library
        createStage(stage, false);
        // clear timers
        // and add time loop for timer
        game.time.events.events = [];
        game.time.events.loop(Phaser.Timer.SECOND, updateTime, this);
        // keep the game running when browser loose focus
        game.stage.disableVisibilityChange = true;
    }

    function updateStateGame() {
        // check for the game end
        checkGoal();
    }

    function renderStateGame() {
        if (debugMode) {
            //
        }
    }

    // -------------------------------------------------------------------------

    function preloadStateIntermission() {
        // only need to preload images once
    }

    function createStateIntermission() {
        console.info('INTERMISSION');
        // create place from library
        createStage(stage, false);
        // get timer, format time elapsed, display message
        var timer = window.kidsAppController.getUIHelper().getTimer(); // FIXME brzydki sposób na pobieranie czasu
        var timeElapsed = timer.getTimeElapsed();
        // stats
        statsTotalTimeElapsed += timeElapsed;
        // create success message
        var message = 'Udało Ci się zidentyfikować kraj w czasie ' + timer.formatTimeForHumans(timeElapsed) + '. Przejdź do kolejnego etapu.';
        // display answer
        if (stagesLibrary[stage-1].answeredGood) {
            $(document).trigger('kids-game-stage-intermission', new KidsEventParameterBag({
                gameApp: selfApp,
                title: labels.intermissionTitleSuccess,
                message: message,
                points: selfApp.getCurrentPoints(),
                gamePlanet: options.gamePlanet
            }));
        } else {
            $(document).trigger('kids-game-stage-intermission', new KidsEventParameterBag({
                gameApp: selfApp,
                title: labels.intermissionTitleFailure,
                message: labels.intermissionMessageFailure,
                points: selfApp.getCurrentPoints(),
                gamePlanet: options.gamePlanet
            }));
        }
    }

    function updateStateIntermission() {
        //
    }

    // -------------------------------------------------------------------------

    function preloadStateEnd() {
        // only need to preload images once
    }

    function createStateEnd() {
        console.info('END');
        // create place from library
        createStage(stage, true);
        // Adding achievements
        var goalPoints = selfApp.getCurrentPoints();
        var achievementCodes = [];
        // ACHIEVEMENTS
        if( goalPoints == 100 ) {
            achievementCodes = ['galaktyczny_przewodnik_poziom_ziemia'];
        }

        var minusArrays = [];
        // odejmij od achievementCodes options.achievementCodes i zapisz jako do wysłania
        for (var i = 0; i < achievementCodes.length; i++) {
            if( $.inArray(achievementCodes[i], options.achievementCodes) == -1 ) {
                minusArrays.push(achievementCodes[i]);
            }
        }
        achievementCodes = minusArrays;

        // dodaj do siebie tablice i zapisz jako options.achievementCodes czyli zdobyte poprzednio dla tej sesji
        options.achievementCodes = kidsAppController.arrayUnique(achievementCodes.concat(options.achievementCodes));

        // get timer, format time elapsed, display message
        var timer = window.kidsAppController.getUIHelper().getTimer(); // FIXME brzydki sposób na pobieranie czasu
        var timeElapsed = timer.getTimeElapsed();

        // stats
        statsTotalTimeElapsed += timeElapsed;

        $(document).trigger('kids-game-over', new KidsEventParameterBag({
            gameApp: selfApp,
            points: goalPoints,
            achievementCodes: achievementCodes,
            gamePlanet: options.gamePlanet
        }));
    }

    function updateStateEnd() {
        //
    }
}
