// scale game
app.helpers.scaleGame = function () {
    // set limit and scale mode to do stuff proportionally
    app.game.stage.scale.maxWidth = app.options.canvasWidth;
    app.game.stage.scale.maxHeight = app.options.canvasHeight;
    app.game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
};

// reset the game
app.helpers.resetGame = function () {
    //
};

// reset the game
app.helpers.getPoints = function () {
    // declarations
    var total = 0;
    // count final points
    app.stages.forEach(function (stage) {
        if (stage.points) {
            total += stage.points;
        }
    });
    // return points
    return totalPoints;
};

// generate stages
app.helpers.generateStages = function (limit) {
    // declarations
    var allStages = [];
    var dinosaurs = app.data.dinosaurs;
    var a, b;
    var tempStage = {};
    var clone;
    // shuffle dinosaurs
    shuffle(dinosaurs);
    // loop through all stages
    for (a = 0; a < limit; a += 1) {
        // clear temp stage object
        tempStage = {};
        // use clone to avoid duplicate changes to objects
        clone = JSON.parse(JSON.stringify(dinosaurs[a]));
        tempStage.dinosaur = clone;
        // add some flags
        tempStage.finished = false;
        // add points counter
        tempStage.points = null;
        tempStage.timeTaken = null;
        // add temp stage to stages
        allStages.push(tempStage);
    }
    return allStages;
};

// go to next stage
app.helpers.goToNextStage = function () {
    // check if it was the last stage
    if (app.status.stage > app.options.stagesLimit) {
        // go to end stage
        app.game.state.start('state-end', true, true);
    } else {
        // increment stages
        stage += 1;
        // start new level
        game.state.start('state-gameplay', true, true);
    }
};



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
