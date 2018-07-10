const formatter = require('./format.js');
const consts = require('../constants.js');
const config = require('../config.json');

LEVEL = {
	DEBUG: 1,
	INFO: 2,
	WARNING: 3,
	CRITICAL: 4,
	MAX: 4
}

class LogManager {
	/**
	 * Constructs a LogManager.
	 * @param {string} [format] String to be used to format messages.
	 * @param {number} [level] Minimum Level required to show messages.
	 */
	constructor(format = consts.LOGGER_FORMAT, level = LEVEL[config.log_level]) {
		// if no (valid) level is defined in config, use INFO
		level = level === undefined ? LEVEL.INFO : level;
		this.cache = [];
		this.format = format;
		this.level = Math.min(level, LEVEL.MAX);
	}

	/**
	 * Gets the Logger from a namespace.
	 * If the namespace hasn't been createdy yet, a new Logger will be created.
	 * @param {string} namespace The namespace.
	 * @returns {Logger} The created or cached Logger.
	 */
	get(namespace) {
		var res = this.cache.find(logger => logger.namespace == namespace);

		// initialize logger if none exists
		if (res === undefined) {
			res = new Logger(namespace, this);
			this.cache.push(res);
		}

		return res;
	}

	/**
	 * Removes a namespace.
	 * @param {string} namespace The namespace to remove
	 */
	remove(namespace) {
		this.cache = this.cache.filter(logger => logger.namespace != namespace);
	}

	/**
	 * @returns {object} Object containing Log-Levels
	 */
	get LEVEL() {
		return LEVEL;
	}
}

/**
 * build an env to use for formatter.format()
 * @param {string} namespace
 * @param {number} level
 * @param {string} message
 * @private
 */
function makeEnv(namespace, level, message = '') {
	var levelString;
	switch (level) {
		case LEVEL.DEBUG:
			levelString = 'DEBUG';
			break;
		case LEVEL.WARNING:
			levelString = 'WARNING';
			break;
		case LEVEL.CRITICAL:
			levelString = 'CRITICAL';
			break;
		default:
			levelString = 'INFO';
	}

	return {
		namespace: namespace,
		date: Date.now(),
		level: levelString,
		message: message,
	};
}

class Logger {
	/**
	 * Constructs a new Logger.
	 * DONT USE THIS!
	 * Use LogManager.get() instead.
	 * @param {string} namespace Namespace the Logger belongs to.
	 * @param {LogManager} manager LogManager the Logger belongs to.
	 */
	constructor(namespace, manager) {
		this.namespace = namespace;
		this.manager = manager;
		this._level = undefined;
		this.silenced = false;
	}

	/**
	 * @returns {number} The Loggers Minimum Level.
	 */
	get level() {
		return this._level !== undefined ? this._level : this.manager.level;
	}

	/**
	 * Sets the Loggers Minimum Level.
	 */
	set level(value) {
		this._level = value;
	}

	/**
	 * Resets the Loggers Minimum Level.
	 */
	resetLevel() {
		this.level = undefined;
	}

	/**
	 * Silences the Logger.
	 */
	silence() {
		this.silenced = true;
	}

	/**
	 * Unsilences the Logger.
	 */
	unsilence() {
		this.silenced = false;
	}

	/**
	 * Is silenced?
	 * @returns {boolean}
	 */
	isSilenced(){
		return this.silenced;
	}

	/**
	 * Logs a Message at specified Level.
	 * @param {number} level Level to log at. See
	 * @param {string} msg
	 */
	log(level, msg = '') {
		// don't log if silenced
		if (!this.silenced) {
			// check if the log level is enabled
			if (level >= this.level) {
				var env = makeEnv(this.namespace, level, msg.toString());
				var logMessage = formatter.format(this.manager.format, env);
				if(level<LEVEL.WARNING)
					console.log(logMessage);
				else
					console.error(logMessage);

			}
		}
	}

	/**
	 * Shorthand for logging at DEBUG-Level
	 * @param {string} msg
	 */
	debug(msg = '') {
		this.log(LEVEL.DEBUG, msg);
	}

	/**
	 * Shorthand for logging at INFO-Level
	 * @param {string} msg
	 */
	info(msg = '') {
		this.log(LEVEL.INFO, msg);
	}

	/**
	 * Shorthand for logging at WARNING-Level
	 * @param {string} msg
	 */
	warning(msg = '') {
		this.log(LEVEL.WARNING, msg);
	}

	/**
	 * Shorthand for logging at CRITICAL-Level
	 * @param {string} msg
	 */
	critical(msg = '') {
		this.log(LEVEL.CRITICAL, msg);
	}
}

module.exports = new LogManager();
