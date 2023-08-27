const fs = require("fs");
const path = require("path");

const LOG_FOLDER = path.resolve("logs");
const SEPARATOR = " ----- ";
const MAX_LOG_SIZE = 5 * 1024 * 1024 * 1024; // 5GB per file

// Switch individual log levels on or off.
const LOG_FATAL = true;
const LOG_ERROR = true;
const LOG_WARN = true;
const LOG_INFO = true;
const LOG_DEBUG = true;
const LOG_TRACE = true;

class Logger {
    referenceCount = 0;
    isEnabled = true;
    logFileName;
    referenceFileName;

    constructor(name) {
        this.logFileName = path.join(LOG_FOLDER, "log_" + name + ".txt");
        this.referenceFileName = path.join(LOG_FOLDER, "reference_log_" + name + ".txt");

        // Create the log files now.
        fs.writeFileSync(this.logFileName, "");
        fs.writeFileSync(this.referenceFileName, "");
    }

    logFatal(categoryName, eventName, ...infoArgs) {
        if(LOG_FATAL && this.isEnabled) {
            this._logEvent("FATAL", categoryName, eventName, ...infoArgs);
        }
    }

    logError(categoryName, eventName, ...infoArgs) {
        if(LOG_ERROR && this.isEnabled) {
            this._logEvent("ERROR", categoryName, eventName, ...infoArgs);
        }
    }

    logWarn(categoryName, eventName, ...infoArgs) {
        if(LOG_WARN && this.isEnabled) {
            this._logEvent("WARN", categoryName, eventName, ...infoArgs);
        }
    }

    logInfo(categoryName, eventName, ...infoArgs) {
        if(LOG_INFO && this.isEnabled) {
            this._logEvent("INFO", categoryName, eventName, ...infoArgs);
        }
    }

    logDebug(categoryName, eventName, ...infoArgs) {
        if(LOG_DEBUG && this.isEnabled) {
            this._logEvent("DEBUG", categoryName, eventName, ...infoArgs);
        }
    }

    logTrace(categoryName, eventName, ...infoArgs) {
        if(LOG_TRACE && this.isEnabled) {
            this._logEvent("TRACE", categoryName, eventName, ...infoArgs);
        }
    }

    _logEvent(levelName, categoryName, eventName, ...infoArgs) {
        // The base log file will have a reference to the full info, if any, in the reference log file.
        let timestamp = new Date().toISOString();
        let logArr = [timestamp, levelName, categoryName, eventName];

        if(infoArgs.length > 0) {
            let reference = "#" + "[" + this.referenceCount++ + "]";
            logArr.push(reference);

            let referenceString = reference + "\n" + infoArgs.join(SEPARATOR) + "\n\n";
            this._doWrite(this.referenceFileName, referenceString);
        }

        let logStr = logArr.join(SEPARATOR) + "\n";
        this._doWrite(this.logFileName, logStr);
    }

    _doWrite(fileName, str) {
        // Write to log file, but if we error or the size would be too big then just print to console and disable logging.
        try {
            let currentSize = fs.statSync(fileName).size;
            let newSize = Buffer.byteLength(str, "utf8");
            let totalSize = currentSize + newSize;
        
            if(totalSize > MAX_LOG_SIZE) {
                this.isEnabled = false;
                console.log("LOG FILE LIMIT REACHED: " + fileName);
                console.log("Last Log String: " + str);
            }
            else {
                fs.appendFileSync(fileName, str);
            }
        }
        catch(err) {
            this.isEnabled = false;
            console.log("LOG FILE ERROR: " + fileName);
            console.log("Last Log String: " + str);
            console.log(err);
        }
    }
}

module.exports = Logger;