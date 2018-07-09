const fs = require('fs');
const path = require('path');
const consts = require('../constants.js');
const logging = require('./logging.js')
const config = require('../config.json');

const log = logging.get('StorageManager')
log.level = logging.LEVEL.DEBUG

// https://stackoverflow.com/a/5344074
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class Handler {
  constructor(path, manager) {
    this.path = path;
    this.manager = manager;
    this.locked = false
  }

  access(callback) {
    this.manager.getData(this.path, (err, data) => {
      // copy data
      var dataCopy;
      if (!err) {
          dataCopy = deepCopy(data);
      }

      // run callback
      callback(err, data);

      // save file if data has been altered
      if (data !== dataCopy) {
        log.debug(this.path + ' has been altered! Saving.')
        this.lock()
        this.manager.saveData(this.path, data, (err) => {
          this.unlock()
          if (err) throw err;
        });
      }
    });
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }
}

class StorageManager {
  constructor(root) {
    // TODO: don't blindly accept path but convert it
    var storage_path = typeof config.storage_path !== undefined ? config.storage_path : 'data';
    this.root = typeof root !== undefined ? root : storage_path;

    this.cache = {};
    this.handlers = {};
  }

  getHandler(path) {
    var res = this.handlers[path];
    if (!res) {
      res = new Handler(path, this);
      this.handlers[path] = res;
    }
    return res
  }

  initFile(path, callback, important=false) {
    fs.writeFile(path, '{}', (err) => {
      if (err) callback(err);

      this.cache[path] = {data: {}, important};
      callback(undefined, {});
    });
  }

  getData(path, callback, important=false) {
    var cached = this.cache[path];
    var data;

    // file is not cached
    if (cached === undefined) {
      // try to read the file
      fs.readFile(path, (err, data) => {
        if (err) {
          // if file could not be found
          if (err.code === 'ENOENT') {
            // init the file
            this.initFile(path, callback, important)
          // this should not happen maybe
          } else {
            throw err;
          }
        // if file loaded
        } else {
          try {
            // try to parse data and add to cache
            data = JSON.parse(data);
            this.cache[path] = {data, important};

            callback(undefined, data)
          } catch (e) {
            // init the file if JSON is corrupted
            if (e instanceof SyntaxError) {
              log.critical('Found corrupted data in file "' + path + '"!');
              log.critical('Reiniting!');

              this.initFile(path, callback, important);
            } else {
                callback(e)
            }
          }
        }
      })
    // if file is cached
    } else {
      log.debug(path + ' found cached')
      callback(undefined, cached.data);
    }
  }

  saveData(path, data, callback) {
    var dataString = JSON.stringify(data);
    fs.writeFile(path, dataString, (err) => {
      if (err) callback(err);

      if (!this.cache[path]) {
        this.cache[path] = {data, important: false};
      } else {
        this.cache[path].data = data;
      }
    });
  }
}

module.exports = new StorageManager()
