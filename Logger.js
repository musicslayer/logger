const fs = require("fs");
const path = require("path");

const ErrorPrinter = require("./ErrorPrinter.js");

// TODO Log levels?

const LOG_FOLDER = path.resolve("logs");
const SEPARATOR = " ----- ";
const MAX_LOG_SIZE = 5 * 1024 * 1024 * 1024; // 5GB per file

class Logger {
	static baseLogger;
    static errorLogger;
    static errorCount = 0;
    static isEnabled = true;
    
    fileName;

    static init() {
        // Create a base log for events and an error log for error stacks.
        // Any error events in the base log will reference the error log.
		Logger.baseLogger = new Logger(path.join(LOG_FOLDER, "log.txt"));
		Logger.errorLogger = new Logger(path.join(LOG_FOLDER, "error_log.txt"));
	}

	static logEvent(category, id, eventName, ...infoArgs) {
        // Log the event to the base log file.
		const timestamp = new Date().toISOString();
		const categoryString = category + "_EVENT";
		const infoString = createInfoString(...infoArgs);

		const str = timestamp + SEPARATOR + categoryString + SEPARATOR + id + SEPARATOR + eventName + SEPARATOR + infoString + "\n";

		Logger.writeToLogFile(str);
	}

	static logError(category, id, errorName, error, ...infoArgs) {
		// Log basic info in the base log file and include a reference to a fuller entry in the error log file.
		const timestamp = new Date().toISOString();
		const categoryString = category + "_ERROR";
		const errorRefString = "#" + "[" + this.errorCount++ + "]";
		const infoString = createInfoString(...infoArgs);
	
		const str = timestamp + SEPARATOR + categoryString + SEPARATOR + id + SEPARATOR + errorName + SEPARATOR + errorRefString + SEPARATOR + infoString + "\n";
        const errorString = errorRefString + "\n" + ErrorPrinter.createErrorString(error) + "\n\n";

		Logger.writeToLogFile(str);
		Logger.writeToErrorLogFile(errorString);
	}

    static writeToLogFile(str) {
        if(Logger.isEnabled) {
            Logger.baseLogger.doWrite(str);
        }
    }

    static writeToErrorLogFile(str) {
        if(Logger.isEnabled) {
            Logger.errorLogger.doWrite(str);
        }
    }

    constructor(fileName) {
		this.fileName = fileName;

		// Create the log file now.
		fs.writeFileSync(fileName, "");
	}	

	doWrite(str) {
		// Write to log file, but if we error or the size would be too big then just print to console and disable logging.
		try {
			let currentSize = fs.statSync(this.fileName).size;
			let newSize = Buffer.byteLength(str, "utf8");
			let totalSize = currentSize + newSize;
		
			if(totalSize > MAX_LOG_SIZE) {
				Logger.isEnabled = false;
				console.log("LOG FILE LIMIT REACHED: " + this.fileName);
				console.log("Last Log String: " + str);
			}
			else {
				fs.appendFileSync(this.fileName, str);
			}
		}
		catch(err) {
			Logger.isEnabled = false;
			console.log("LOG FILE ERROR: " + this.fileName);
            console.log("Last Log String: " + str);
			console.log(err);
		}
	}
}

function createInfoString(...infoArgs) {
    return infoArgs.join("|");
}

module.exports = Logger;