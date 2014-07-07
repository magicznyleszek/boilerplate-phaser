function KlockiApp(ageRangeDificultyMultiplier, options) {
    // Contents:
    // 1. declarations
    // 2. public game interface
    // 3. helper functions
    // 4. main game states functions


    // -------------------------------------------------------------------------
    // declarations
    // -------------------------------------------------------------------------

    // received options and defaults
    var defaults = {
        achievementCodes: [],
        gamePlanet: null
    };
    options = $.extend({}, defaults, options);

    // game planet option for "wyjdź z gry" link // FIXME by pepis - zła praktyka
    this.gamePlanet = options.gamePlanet;

    // html stuff
    var container = document.querySelector('section.content');
    var imgPath = 'assets/img/games/klocki/';

    // blocks library
    // in which every block has a slug (for image/sprite)
    // width and height for blocks creation,
    // and hot-anchors to indicate where are the block squares in the block sprite
    var blocksLibrary = [
        {
            slug: '1',
            width: 1,
            height: 3,
            anchors: [[1,1],[1,2],[1,3]]
        },
        {
            slug: 'dash',
            width: 2,
            height: 1,
            anchors: [[1,1],[2,1]]
        },
        {
            slug: 'dot',
            width: 1,
            height: 1,
            anchors: [[1,1]]
        },
        {
            slug: 'i',
            width: 4,
            height: 1,
            anchors: [[1,1],[2,1],[3,1],[4,1]]
        },
        {
            slug: 'j',
            width: 2,
            height: 3,
            anchors: [[2,1],[2,2],[2,3],[1,3]]
        },
        {
            slug: 'l',
            width: 2,
            height: 3,
            anchors: [[1,1],[1,2],[1,3],[2,3]]
        },
        {
            slug: 'o',
            width: 2,
            height: 2,
            anchors: [[1,1],[1,2],[2,1],[2,2]]
        },
        {
            slug: 'r',
            width: 2,
            height: 2,
            anchors: [[1,1],[2,1],[1,2]]
        },
        {
            slug: 's',
            width: 3,
            height: 2,
            anchors: [[2,1],[3,1],[1,2],[2,2]]
        },
        {
            slug: 't',
            width: 3,
            height: 2,
            anchors: [[1,1],[2,1],[3,1],[2,2]]
        },
        {
            slug: 'z',
            width: 3,
            height: 2,
            anchors: [[1,1],[2,1],[2,2],[3,2]]
        }
    ];
    // lookup object: http://stackoverflow.com/a/7364247
    var blocksLibraryLookup = {};
    for (var i = 0; i < blocksLibrary.length; i++) {
        blocksLibraryLookup[blocksLibrary[i].slug] = blocksLibrary[i];
    }

    // boards library
    // in which every board has a slug (for image/sprite),
    // width and height for proper hot-anchors placement
    var boardsLibrary = [
        {slug: 'four-by-three', width: 4, height: 3},
        {slug: 'four-by-four', width: 4, height: 4},
        {slug: 'four-by-five', width: 4, height: 5},
        {slug: 'six-by-four', width: 6, height: 4},
        {slug: 'six-by-five', width: 6, height: 5},
    ];
    // lookup object: http://stackoverflow.com/a/7364247
    var boardsLibraryLookup = {};
    for (var j = 0; j < boardsLibrary.length; j++) {
        boardsLibraryLookup[boardsLibrary[j].slug] = boardsLibrary[j];
    }

    // stages library
    // in which every stage has a level number,
    // a defined board and blocks it uses
    // -- with different valuse for different age range
    var stagesLibrary = [];
    if (ageRangeDificultyMultiplier === 1) {
        stagesLibrary = [
            {board: 'four-by-three', blocks: ['dot','z','1','t']},
            {board: 'four-by-four', blocks: ['dot','s','t','r','i']},
            {board: 'four-by-five', blocks: ['t','i','z','dot','j','1']}
        ];
    } else {
        stagesLibrary = [
            {board: 'four-by-five', blocks: ['t','i','z','dot','j','1']},
            {board: 'six-by-four', blocks: ['1','z','i','j','j','dot','t']},
            {board: 'six-by-five', blocks: ['t','j','dash','l','z','s','t','i']}
        ];
    }
    // shuffle the blocks in stages library to increase game variety
    stagesLibrary.forEach(function (itemObject) {
        shuffle(itemObject.blocks);
    });

    // main elements
    var blocks;
    var board;
    var boardAnchors;
    var isBoardCovered = 0;
    var currentStage;

    // block location limits
    var blockMinimumX = 40;
    var blockMaximumX = 960;
    var blockMinimumY = 40;
    var blockMaximumY = 720;

    // game settings
    var stage = 1; // starting stage
    var totalStages = 3;
    var timerIsAllowedToStart = true;

    // scoring
    var pointsPerStage = new Array(totalStages);
    var pointsMaximum = 100;
    var pointsMinimum = 5;
    var time = 0; // s
    var timeMaximum = 300; // s
    var timeMinimum = 45; // s

    // the game
    var game = new Phaser.Game(1024, 768, Phaser.CANVAS, container);

    // debug
    var debugMode = false;

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

    var labels = {
        intermissionTitle: 'Etap zakończony'
        //intermissionMessage: 'Udało Ci się załadować bagażnik!'
    };

    // stats
    var statsTotalTimeElapsed = 0;

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

    // lets call it a public method required by the interface
    this.getGame = function () {
        return game;
    };

    // returns current stage
    this.getCurrentStage = function() {
        return stage;
    };

    // reset the game state
    this.resetInternals = function () {
        // set initial values
        isBoardCovered = 0;
        stage = 1; // starting stage
        totalStages = 3;
        time = 0; // s
        pointsPerStage = new Array(totalStages);

        // stats
        statsTotalTimeElapsed = 0;

        // trigers an event that updates sidebar
        $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: totalStages}));
    };

    // application descriptor, used by apiclient.js and various popups
    this.getDescriptor = function() {
        return {
            code: 'klocki',
            name: 'Galaktyczny transport',
            description: 'Zanim Toyota Hilux zacznie przemierzać galaktykę, trzeba odpowiednio załadować bagażnik, aby żaden z gwiezdnych towarów nie ucierpiał podczas transportu.',
            iconPath: imgPath+'icon.png'
        };
    };

    // tells whether timer should start with delay (event kids-game-start-timer)
    this.isTimerAllowedToStartAutomatically = function() {
        return timerIsAllowedToStart;
    };

    // steps that are used in tutorial popup, note that if you define onLeaveCallback you must then
    // trigger $(document).trigger('kids-tutorial-next-step', new KidsEventParameterBag()); at the end
    this.getTutorialSteps = function () {
        return [
           {
                html: 'Wybierz paczkę o dowolnym kształcie, podwójnie klikając w nią obróć do właściwej według Ciebie pozycji i przeciągnij w wybrane miejsce.',
                onEnterCallback: function() { /* Animate something */
                    // TweenLite.to('canvas', .4, {autoAlpha: 0.2});
                },
                onLeaveCallback: function() {
                    // TweenLite.to('canvas', .4, {autoAlpha: 1});
                    $(document).trigger('kids-tutorial-next-step', new KidsEventParameterBag());
                }
            },
            {
                html: 'Każdą paczkę możesz obrócić i przesunąć w dowolnym momencie. Do kolejnego poziomu gry możesz przejść dopiero wtedy, gdy wszystkie paczki zostaną poprawnie umieszczone w bagażniku.',
                onEnterCallback: function() { /* Animate something */
                },
                onLeaveCallback: function() {
                    $(document).trigger('kids-tutorial-next-step', new KidsEventParameterBag());
                }
            },
            {
                html: 'Do dzieła! Zbieraj punkty i pamiętaj, że czas ucieka. Jeżeli się postarasz, zostaniesz doskonałym pakowaczem.',
                onEnterCallback: function() { /* Animate something */
                },
                onLeaveCallback: function() {
                    $(document).trigger('kids-tutorial-next-step', new KidsEventParameterBag());
                }
            }
        ];
    };

    // returns current points
    // this method will be often used to save user points on intermission state
    this.getCurrentPoints = function () {
        // // you start with the maximum points
        // var finalPoints = pointsMaximum;
        // // get the point per second value for final count
        // var pointsPerSecond = pointsMaximum / (timeMaximum - timeMinimum);
        // // check if final time was above minimum
        // // and below maximum
        // if (time > timeMinimum) {
        //     if (time < timeMaximum) {
        //         // count the points
        //         finalPoints = Math.floor(100 - ((time - timeMinimum) * pointsPerSecond));
        //     } else {
        //         // give minimum
        //         finalPoints = pointsMinimum;
        //     }
        // }
        // return Math.round(finalPoints * stage/totalStages);


        var currentPoints = 0;
        var currentStagePoints;
        var currentTime = time;
        // check if the time is out of lower/upper limits
        if (currentTime <= timeMinimum) {
            currentStagePoints = pointsMaximum / totalStages;
        } else if (currentTime >= timeMaximum) {
            currentStagePoints = pointsMinimum / totalStages;
        } else {
            // count points per second
            var pointsPerSecond = (pointsMaximum - pointsMinimum) / (timeMaximum - timeMinimum);
            currentStagePoints = (pointsMaximum - (currentTime - timeMinimum) * pointsPerSecond) / totalStages;
        }
        // note down points for current stage
        pointsPerStage[stage-1] = currentStagePoints;
        // count final points
        pointsPerStage.forEach(function (_stagePoints) {
            if (isNumber(_stagePoints)) {
                currentPoints += _stagePoints;
            }
        });
        // console.log(currentTime, pointsPerStage);

        // hardcoded limit, can fake the results, comment it out if you debug points
        if( currentPoints > 100 )
        {
            currentPoints = 100;
        }
        return Math.round(currentPoints);
    };


    // -------------------------------------------------------------------------
    // helper functions
    // -------------------------------------------------------------------------

    // check if is number
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Fisher-Yates shuffle algorithm: http://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
        var m = array.length, t, i;
        // while there remain elements to shuffle
        while (m) {
            // pick a remaining element
            i = Math.floor(Math.random() * m--);
            // and swap it with the current element
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    // game board creator
    function createBoard() {
        // add board background
        // with spritesheet animation
        board = game.add.sprite(352, 200, boardsLibraryLookup[currentStage.board].slug);
        board.animations.add('blink');
        // start animation with given fps and looping set to true
        board.animations.play('blink', 2, true);
        // stop animation after some time
        setTimeout(function () {
            board.animations.stop('blink');
            board.frame = 0;
        }, 6000);
        // create group of touchy anchors
        boardAnchors = game.add.group();
        // calculate the proper position for anchors
        var boardWidth = boardsLibraryLookup[currentStage.board].width; // in squares
        var boardHeight = boardsLibraryLookup[currentStage.board].height; // in squares
        var boardLeft = 2 + board.x + (320 - 40 * boardWidth) / 2; // horizontal center position
        var boardTop = 2 + board.y;
        // the vertical position is not regular, so we check the different cases
        if (boardHeight * boardWidth === 12 || boardHeight * boardWidth === 24) {
            boardTop += 40;
        }
        // create all hot-anchors for current board
        // in a matrix kind of way
        for (var a = 0; a < boardHeight; a++) {
            for (var b = 0; b < boardWidth; b++) {
                // create anchor sprite
                var anchor = boardAnchors.create(boardLeft + 40 * (b), boardTop + 40 * (a), 'blank-40');
                // define the matrix position for anchor
                anchor.isCovered = 0;
                // change collision body to small circle
                anchor.body.setCircle(8, 20, 20);
            }
        }
    }

    // blocks creator
    function createBlocks() {
        // left position for nice distribution based on blocks number for current stage
        var left = 0;
        // create group of blocks
        blocks = game.add.group();
        // loop over all blocks for current stage
        // and create draggable and droppable blocks
        currentStage.blocks.forEach(function (item) {
            // get object from library
            var libraryItem = blocksLibraryLookup[item];
            // create block in blocks group
            var block = blocks.create(left, 639, libraryItem.slug);
            block.name = libraryItem.slug;
            // create hot-anchors group
            // and position it the same as parent block
            block.anchorsGroup = game.add.group();
            block.anchorsGroup.x = block.x;
            block.anchorsGroup.y = block.y;
            // create all hot-anchors for parent block
            libraryItem.anchors.forEach(function (itemArray) {
                // count the position for the anchor
                // counting from the (x,y) of parent block
                var anchorX = 40 * (itemArray[0] - 1);
                var anchorY = 40 * (itemArray[1] - 1);
                var anchor = block.anchorsGroup.create(anchorX, anchorY, 'blank-40');
                // change collision body to smaller circle
                anchor.body.setCircle(4, 20, 20);
            });
            // make it draggable with enableDrag
            // and parameters: lockCenter, bringToTop, pixelPerfect
            block.inputEnabled = true;
            block.input.pixelPerfect = true;
            block.input.useHandCursor = true;
            block.input.enableDrag(false, true, true);
            // make it snappable with enableSnap
            // and parameters: x, y, onDrag, onRelease
            block.input.enableSnap(40, 40, false, true);
            // offset snapping to sync with the board position
            block.input.snapOffsetX = board.x + 2;
            block.input.snapOffsetY = board.y + 2;
            // prevent dragging outside game world
            block.input.boundsRect = game.world.bounds;
            // on drag-stop move the anchors group accordingly
            block.events.onDragStop.add(function (itemBlock) {
                // wait for a secure 200 ms for the block to snap
                setTimeout(function () {
                    // move the anchors group with the block
                    glueAnchors(itemBlock, false);
                }, 200);
            });
            // on doubletap rotate the block with its hot-anchors
            block.events.onInputDown.add(function (itemBlock) {
                // check if it is doubletap based on last touched time
                if (game.time.now - game.input.doubleTapRate <= itemBlock.lastTouched) {
                    // rotate block and its anchors by 90 deg
                    itemBlock.angle += 90;
                    itemBlock.anchorsGroup.angle += 90;
                    // move the anchors group with the block
                    glueAnchors(itemBlock, true);
                }
                // set the last touched time
                itemBlock.lastTouched = game.time.now;
            });
            // increment the left position
            left += block.width + 10;
        });
        // // move blocks to center
        blocks.forEach(function (_item) {
            _item.x += (game.width - left) / 2;
        });
    }

    // stage element creator
    function createStage(_number) {
        // shorthand variable for current stage
        currentStage = stagesLibrary[_number-1];
        // create board
        createBoard();
        // create blocks for current level
        createBlocks();
    }

    // game time update
    function updateTime() {
        time += 1;
    }

    // checking if the requirements for game end are met
    function checkGoal() {
        // check if it was final stage -> end game
        // or if the current board is fully covered -> next stage
        if (stage > totalStages || (stage === totalStages && isBoardCovered === 1)) {
            // go to the state end
            game.state.start('state-end', true, true);

            // adding achevement after completing 3 levels
            var achievementCodes = ['doskonaly_pakowacz'];

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

            var endMessage = '<h2 class="yellow">Gra ukończona!!</h2> Udało Ci się przejść grę w czasie '+timer.formatTimeForHumans(statsTotalTimeElapsed)+'.<br><br>Punkty zdobyte od początku gry: {{points}}';

            // broadcasts the game oves along with the points to the air
            $(document).trigger('kids-game-over', new KidsEventParameterBag({
                gameApp: selfApp,
                points: selfApp.getCurrentPoints(),
                achievementCodes: achievementCodes,
                endMessage: endMessage,
                gamePlanet: options.gamePlanet
            }));
        } else if (isBoardCovered === 1) {
            // set the check to false
            isBoardCovered = 0;
            // update sidebar
            $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: totalStages}));
            // go to the intermission between levels
            game.state.start('state-intermission', true, true);
        }
    }

    // overlapping hot-anchors
    function blocksOverlapHandler(_blockAnchor, _boardAnchor) {
        // set check-variable to true
        _boardAnchor.isCovered = 1;
    }

    // for moving and rotating the anchors together with block
    function glueAnchors(_block, _isRotation) {
        // get the rotation direction
        // and fake-movement direction
        var rotationModifierX = 0;
        var rotationModifierY = 0;
        var moveX = 0;
        var moveY = 0;
        switch (_block.angle) {
            case 90:
                rotationModifierX = -1;
                moveX = 1;
                break;
            case -180:
                rotationModifierX = -1;
                rotationModifierY = -1;
                moveY = 1;
                break;
            case -90:
                rotationModifierY = -1;
                moveX = -1;
                break;
            default: // case 0:
                moveY = -1;
                break;
        }
        // check if the function was triggered by double-tap
        // and move the block to fake the center-point rotation
        if (_isRotation) {
            _block.x += moveX * _block.width;
            _block.y += moveY * _block.height;
        }
        // move the hot-anchors group with the block
        _block.anchorsGroup.x = _block.x + (40 * rotationModifierX);
        _block.anchorsGroup.y = _block.y + (40 * rotationModifierY);
    }

    // go to next stage
    this.goToNextStage = function() {
        // increment stages
        stage ++;
        // reset values
        isBoardCovered = 0;
        time = 0; // s
        // update sidebar
        // but only if the stage number makes sense
        if (stage <= totalStages) {
            $(document).trigger('kids-game-status-change', new KidsEventParameterBag({gameApp: selfApp, stage: stage, totalStages: totalStages}));
        }
        // start new level
        game.state.start('state-game', true, true);
    };

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
        // Warning! background images needs to have
        // square-of-2 dimensions (64, 128, etc.)
        game.load.image('background', imgPath + 'space-background.jpg');
        // load all boards sprites from table
        boardsLibrary.forEach(function (itemBoard) {
            game.load.spritesheet(itemBoard.slug, imgPath + 'boards/' + itemBoard.slug + '.png?v=4', 324, 204, 2);
        });
        // load all blocks sprites from table
        blocksLibrary.forEach(function (itemBlock) {
            game.load.image(itemBlock.slug, imgPath + 'blocks/' + itemBlock.slug + '.png?v=3');
        });
        // load the rest of images
        game.load.image('hilux-from-behind', imgPath + 'hilux-from-behind.png');
        game.load.image('blocks-bar', imgPath + 'blocks-bar.png');
        game.load.image('blank-40', imgPath + 'blank-40.png');
    }

    function createStateStart() {
        // create background
        game.add.tileSprite(0, 0, 1024, 1024, 'background');
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
        // create background and hilux sprite
        game.add.tileSprite(0, 0, 1024, 1024, 'background');
        game.add.sprite(0, 0, 'hilux-from-behind');
        // add blocks bar
        game.add.sprite(0, 629, 'blocks-bar');
        // clear timers
        // and add time loop for timer
        game.time.events.events = [];
        game.time.events.loop(Phaser.Timer.SECOND, updateTime, this);
        // create stage
        createStage(stage);
        // keep the game running when browser loose focus
        game.stage.disableVisibilityChange = true;
    }

    function updateStateGame() {
        // clear the board coverage variables for all the anchors
        boardAnchors.forEach(function (item) {
            item.isCovered = 0;
        });
        // check the overlap of the anchors of each block
        // and the anchors of the board
        blocks.forEach(function (itemBlock) {
            game.physics.overlap(itemBlock.anchorsGroup, boardAnchors, blocksOverlapHandler, null, this);
        });
        // set the isBoardCovered to true and
        // check if all board fields are true
        isBoardCovered = 1;
        boardAnchors.forEach(function (item) {
            isBoardCovered *= item.isCovered;
        });
        // check for the game end
        checkGoal();
    }

    function renderStateGame() {
        if (debugMode) {
            // show overlap body shapes and circles
            blocks.forEach(function (itemBlock) {
                game.debug.renderSpriteBody(itemBlock, 'rgb(150,150,150)');
                itemBlock.anchorsGroup.forEach(function (itemAnchor) {
                    game.debug.renderPhysicsBody(itemAnchor.body, 'rgb(0,0,255)');
                });
            });
            boardAnchors.forEach(function (itemBoardAnchor) {
                game.debug.renderPhysicsBody(itemBoardAnchor.body, 'rgb(255,0,0)');
            });
        }
    }

    // -------------------------------------------------------------------------

    function preloadStateIntermission() {
        // only need to preload images once
    }

    function createStateIntermission() {
        // create background
        game.add.tileSprite(0, 0, 1024, 1024, 'background');

         // get timer, format time elapsed, display message
        var timer = window.kidsAppController.getUIHelper().getTimer(); // FIXME brzydki sposób na pobieranie czasu
        var timeElapsed = timer.getTimeElapsed();
        var message = 'Udało Ci się załadować bagażnik w czasie '+timer.formatTimeForHumans(timeElapsed)+'.';

        // stats
        statsTotalTimeElapsed += timeElapsed;

        // wait for a while and go to next stage
        $(document).trigger('kids-game-stage-intermission', new KidsEventParameterBag({
            gameApp: selfApp,
            title: labels.intermissionTitle,
            message: message,
            points: selfApp.getCurrentPoints(),
            gamePlanet: options.gamePlanet
        }));
    }

    function updateStateIntermission() {
        //
    }

    // -------------------------------------------------------------------------

    function preloadStateEnd() {
        // only need to preload images once
    }

    function createStateEnd() {
        // create background
        game.add.tileSprite(0, 0, 1024, 1024, 'background');
    }

    function updateStateEnd() {
        //
    }
}
