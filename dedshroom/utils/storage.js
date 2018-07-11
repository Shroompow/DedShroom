const fs = require('fs');
const path = require('path');
const consts = require('../constants.js');
const logging = require('./logging.js')
const config = require('../config.json');

const log = logging.get('StorageManager');
log.level = logging.LEVEL.DEBUG

// https://stackoverflow.com/a/5344074
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function areEqual(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}

class Handle {
  constructor(path, manager) {
    this.path = path;
    this.manager = manager;
    this._locked = false;
  }

  access(modify) {
    return new Promise((resolve, reject) => {
      this.awaitUnlock().then(() => {
        this._lock();
        this.manager.getData(this.path).then((data) => {
          // copy data
          var dataCopy = deepCopy(data)

          // run data modification
          if (typeof modify === 'function') {
            log.debug('before modify: ' + JSON.stringify(data))
            modify(data);
            log.debug('after modify: ' + JSON.stringify(data))
          }

          // make data read-only for .then
          var frozen = Object.freeze(data);

          // save file if data has been altered
          if (!areEqual(data, dataCopy)) {
            log.debug(this.path + ' has been altered! Saving.')
            this.manager.saveData(this.path, data).then(() => {
              this._unlock();
              resolve(frozen);
            }, (err) => {
              // this souldn't ever happen
              reject(err);
            });
          } else {
            this._unlock();
            resolve(frozen);
          }
        }, (err) => {
            this._unlock()
            reject(err);
          });
      });
    });
  }

  _lock() {
    this._locked = true;
  }

  _unlock() {
    this._locked = false;
  }

  isLocked() {
    return this._locked;
  }

  awaitUnlock() {
    return new Promise(resolve => {
      // check revursively whether the handler is unlocked
      const check = () => {
        if (this.isLocked()) {
          log.debug('Handle "' + this.path + '" is locked! Checking again in 100ms!')
          setTimeout(check, 100);
        } else {
          resolve();
        }
      }
      check();
    });
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

  getHandle(path) {
    var res = this.handlers[path];
    if (!res) {
      res = new Handle(path, this);
      this.handlers[path] = res;
    }
    return res
  }

  initFile(path, important=false) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, '{}', (err) => {
        if (err) reject(err);

        this.cache[path] = {data: {}, important};
        resolve(this.cache[path].data);
      });
    });
  }

  getData(path, important=false) {
    return new Promise((resolve, reject) => {
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
              this.initFile(path, important).then((data) => {
                resolve(data);
              }, (err) => {
                reject(data);
              });
            // this should not happen maybe
            } else {
              log.critical('Unknown error: ' + err);
              reject(err);
            }
          // if file loaded
          } else {
            try {
              // try to parse data and add to cache
              data = JSON.parse(data);
              this.cache[path] = {data, important};

              resolve(data);
            } catch (e) {
              // init the file if JSON is corrupted
              if (e instanceof SyntaxError) {
                log.critical('Found corrupted data in file "' + path + '"!');
                log.critical('Reiniting!');

                this.initFile(path, important).then((data) => {
                  resolve(data);
                }, (err) => {
                  reject(err);
                });
              } else {
                  reject(e);
              }
            }
          }
        });
      // if file is cached
      } else {
        log.debug(path + ' found cached');
        // need to serve a copy of cached.data or else changes won't be detected
        resolve(deepCopy(cached.data));
      }
    });
  }

  saveData(path, data) {
    return new Promise((resolve, reject) => {
      try {
        var dataString = JSON.stringify(data);
      } catch (e) {
        reject(e);
      }

      fs.writeFile(path, dataString, (err) => {
        if (err) reject(err);

        if (!this.cache[path]) {
          this.cache[path] = {data, important: false};
        } else {
          this.cache[path].data = data;
        }
        resolve();
      });
    });
  }
}

module.exports = new StorageManager()
