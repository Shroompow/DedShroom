const fs = require('fs');
const path = require('path');
const consts = require('../constants.js');
const fmt = require('./format.js');
const logging = require('./logging.js');
const config = require('../config.json');

const log = logging.get('StorageManager');
log.level = logging.LEVEL.DEBUG;

STORAGE_TYPE = {
  USER : 0,
  GUILD : 1,
  CHANNEL : 2,
  MODULE : 3,
  DEFAULT: 4
}

TYPE_INFO = [
  {path: 'users/${id}', initData: {}},
  {path: 'guilds/${id}', initData: {}},
  {path: 'channels/${id}', initData: {}},
  {path: 'modules/${id}', initData: {}},
  {path: '${id}', initData: {}}
]

function win32ToPosix(path) {
  return path.replace(/([A-Za-z]):\\/, '/$1/').replace(/\\/g, '/');
}

function posixToWin32(path) {
  return path.replace(/\/([A-Za-z])\//, '$1:\\').replace(/\//g, '\\');
}

// https://stackoverflow.com/a/5344074
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// https://stackoverflow.com/a/1144249
function areEqual(o1, o2) {
  return JSON.stringify(o1) === JSON.stringify(o2);
}

class Handle {
  constructor(path, initData, important, manager) {
    this.path = path;
    this.initData = initData;
    this.manager = manager;
    this._important = important;
    this._locked = false;
  }

  isImportant() {
    return this._important;
  }

  toggleImportant(state) {
    if (typeof state !== 'boolean') {
      this._important = !this._important;
    } else {
      this._important = state;
    }
    this.manager.updateImportant(this.path, this._important);
  }

  access(modify) {
    return new Promise((resolve, reject) => {
      this.awaitUnlock().then(() => {
        this._lock();
        this.manager.getData(this.path, this.initData, this._important).then((data) => {
          // copy data
          var dataCopy = deepCopy(data);

          // run data modification
          if (typeof modify === 'function') {
            log.debug('before modify: ' + JSON.stringify(data));
            modify(data);
            log.debug('after modify: ' + JSON.stringify(data));
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
              // this shouldn't ever happen
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

  getHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }
    // need to remove root dir from path because it'll get added by
    // Handle constructor
    var unrootedPath = this.path.replace(this.manager.root, '');
    var dir = path.posix.dirname(unrootedPath);
    var file = path.posix.basename(unrootedPath).replace('.json', '');
    // add handle path as first argument to getHandle
    // makes this handle the "root" of the new one
    args.unshift(dir + '/' + file);
    return this.manager.getHandle(important, ...args);
  }

  getUserHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.USER, ...args);
  }

  getGuildHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.GUILD, ...args);
  }

  getChannelHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.CHANNEL, ...args);
  }

  getModuleHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.MODULE, ...args);
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
    var storage_path = config.storage_path !== undefined ? config.storage_path : 'data';
    this.root = root !== undefined ? win32ToPosix(root) : win32ToPosix(storage_path);

    this.cache = {};
    this.handles = {};
  }

  getHandle(important=false, ...args) {
    // make the important flag optional
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }
    log.debug('handle is important: ' + important.toString())

    var handlePath = '${id}';
    var info = TYPE_INFO[STORAGE_TYPE.DEFAULT];
    // strip .json extension
    var filename = args.pop().replace('.json', '');

    // construct the path out of chained storage types / strings
    for (var arg of args) {
      if (typeof arg === 'number') {
        var type = Math.min(arg, STORAGE_TYPE.DEFAULT);
        info = TYPE_INFO[type];
        handlePath = fmt.format(handlePath, {id: info.path});
      } else {
        // make sure the string has a trailing / and add the ${id} formatting
        var dirString = arg.toString().replace(/\/$/, '') + '/';
        handlePath = fmt.format(handlePath, {id: dirString + '${id}'});
      }
    }

    // add the filename
    handlePath = fmt.format(handlePath, {id: filename});
    handlePath = handlePath + '.json';

    // add root
    var fullPath = path.posix.join(this.root, handlePath);
    log.debug('adding handler with path: ' + fullPath);

    var res = this.handles[fullPath];
    if (!res) {
      res = new Handle(fullPath, info.initData, important, this);
      this.handles[fullPath] = res;
    }
    return res;
  }

  getUserHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.USER, ...args);
  }

  getGuildHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.GUILD, ...args);
  }

  getChannelHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.CHANNEL, ...args);
  }

  getModuleHandle(important=false, ...args) {
    if (typeof important !== 'boolean') {
      args.unshift(important);
      important = false;
    }

    return this.getHandle(important, STORAGE_TYPE.MODULE, ...args);
  }

  initFile(filePath, data={}, important=false) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), (err) => {
        if (err) {
          // if directories don't exist, create them
          if (err.code === 'ENOENT') {
            var dirPath = path.posix.dirname(filePath);
            var dirs = dirPath.split('/');
            var tmp = '';
            log.debug('creating missing dirs');
            // loop over all dirs in order
            for (var dir of dirs) {
              // add new dir as a subdir of previous
              tmp = tmp + dir + '/';
              try {
                fs.mkdirSync(tmp);
              } catch (e) {
                if (e.code === 'EEXIST') {
                  // if it already exists, ignore
                  continue;
                } else {
                  // something's really wrong
                  reject(e);
                  return;
                }
              }
            }
            // try to write the file again after constucting directory
            fs.writeFile(filePath, JSON.stringify(data), (err) => {
              if (err) {
                reject(err);
                return;
                }
              });
            } else {
              reject(err);
              return;
            }
          }
          this.cache[filePath] = {data, important};
          resolve(this.cache[filePath].data);
      });
    });
  }

  getData(path, initData={}, important=false) {
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
              this.initFile(path, initData, important).then((data) => {
                resolve(data);
              }, (err) => {
                reject(err);
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

                this.initFile(path, initData, important).then((data) => {
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

  updateImportant(path, state) {
    if (this.cache[path] !== undefined) {
      this.cache[path]['important'] = state;
    }
  }
}

module.exports = new StorageManager();
