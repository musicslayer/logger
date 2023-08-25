const Logger = require("./Logger.js");

async function init() {
    Logger.init();

    Logger.logEvent("CLIENT", "main", "Event 1");
    Logger.logEvent("GAME", "me", "Event 2");

    try {
        throw("Sample Error!");
    }
    catch(err) {
        Logger.logError("SERVER", "you", "Event 3", err);
    }

    try {
        throwError();
    }
    catch(err) {
        Logger.logError("SERVER", "you", "Event 4", err);
    }
}
init();

function throwError() {
    throw("Sample Function Error!");
}