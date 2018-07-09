const formatter = require('./format.js');
const consts = require('../constants.js');

LEVEL = {
  DEBUG: 1,
  INFO: 2,
  WARNING: 3,
  CRITICAL: 4
}

class LogManager {
  constructor(format=consts.LOGGER_FORMAT, level=LEVEL.INFO) {
    this.cache = [];
    this.format = format;
    this.level = level;
  }

  // get the (cached) logger for the namespace
  get(namespace) {
    var res = this.cache.find(logger => logger.namespace == namespace);

    // initialize logger if none exists
    if (res === undefined) {
      res = new Logger(namespace, this);
      this.cache.push(res);
    }

    return res;
  }

  remove(namespace) {
    this.cache = this.cache.filter(logger => logger.namespace != namespace);
  }

  // include the loglevel enum
  get LEVEL() {
    return LEVEL;
  }
}

// build an env to use for formatter.format()
function makeEnv(namespace, level, message='') {
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
  constructor(namespace, manager) {
    this.namespace = namespace;
    this.manager = manager;
    this._level = undefined;
    this.silenced = false;
  }

  get level() {
    return this._level !== undefined ? this._level : this.manager.level;
  }

  set level(value) {
    this._level = value;
  }

  resetLevel() {
    this.level = undefined;
  }

  silence() {
    this.silenced = true;
  }

  unsilence() {
    this.silenced = false;
  }

  log(level, msg='') {
    // don't log if silenced
    if (!this.silenced) {
      // check if the log level is enabled
      if (level >= this.level) {
        var env = makeEnv(this.namespace, level, msg.toString())
        var logMessage = formatter.format(this.manager.format, env)
        console.log(logMessage)
      }
    }
  }

  // shorthands
  debug(msg='') {
    this.log(LEVEL.DEBUG, msg);
  }

  info(msg='') {
    this.log(LEVEL.INFO, msg);
  }

  warning(msg='') {
    this.log(LEVEL.WARNING, msg);
  }

  critical(msg='') {
    this.log(LEVEL.CRITICAL, msg);
  }
}

module.exports = new LogManager();
