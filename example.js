const ErrorPrinter = require("./ErrorPrinter.js");
const Logger = require("./Logger.js");

async function init() {
    let loggerA = new Logger("foo");
    let loggerB = new Logger("baz");
    
    loggerA.logInfo("CLIENT", "Event 1");
    loggerB.logInfo("CLIENT", "Event 1", "Extra 1");

    loggerA.logInfo("GAME", "Event 2");
    loggerB.logInfo("GAME", "Event 2", "Extra 1", "Extra 2");
    loggerB.logInfo("GAME", "Event 2b", "Extra 3", "Extra 4");

    try {
        throw("Sample Error!");
    }
    catch(err) {
        loggerA.logError("SERVER", "Event 3", ErrorPrinter.createErrorString(err));
        loggerB.logError("SERVER", "Event 3", ErrorPrinter.createErrorString(err));
    }

    try {
        throwError();
    }
    catch(err) {
        loggerA.logError("SERVER", "Event 4", ErrorPrinter.createErrorString(err));
        loggerB.logError("SERVER", "Event 4", ErrorPrinter.createErrorString(err));
    }
}
init();

function throwError() {
    subFunction();
}

function subFunction() {
    throw new Error("Sample Function Error!");
}