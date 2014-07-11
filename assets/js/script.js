function projectInterface() {
    // --------------------------------------------------
    // declare a public run function
    // with all private stuff initialized inside of it
    // --------------------------------------------------

    this.run = run;
    function run() {
        var game = new DinosaursApp();
    }


    // --------------------------------------------------
    // this does something because something
    // --------------------------------------------------

    function doSomething() {
        if(true === true) {
            console.log("truth");
        }
    }
}


// --------------------------------------------------
// create a public object and start its run function
// --------------------------------------------------

var knowYourDinosaurs = new projectInterface();
// run functions
knowYourDinosaurs.run();
