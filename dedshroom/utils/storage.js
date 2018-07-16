const fs = require('fs');
const path = require('path');
const consts = require('../constants.js');
const fmt = require('./format.js');
const logging = require('./logging.js');
const config = require('../config.json');

const log = logging.get('StorageManager');

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

/**
* Converts a windows path to a posix path.
* @param {string} path The path to convert.
* @returns {string}
*/
function win32ToPosix(path) {
	return path.replace(/([A-Za-z]):\\/, '/$1/').replace(/\\/g, '/');
}

/**
* Converts a posix path to a windows path.
* @param {string} path The path to convert.
* @returns {string}
*/
function posixToWin32(path) {
	return path.replace(/\/([A-Za-z])\//, '$1:\\').replace(/\//g, '\\');
}

/**
* Creates a recursive copy of an object.
* NOTE: Only JSON serializable attributes will be copied!
*       Plain Date() objects will not be copied correctly this way!
* @param {object} obj The object to create a copy of.
* @returns {object}
*/
function deepCopy(obj) {
	// https://stackoverflow.com/a/5344074
	return JSON.parse(JSON.stringify(obj));
}

/**
* Checks whether two objects are equal.
* NOTE: Only JSON serializable attributes will be compared!
*       Order of attributes is important!
* @param {object} o1 The first object.
* @param {object} o2 The second object.
* @returns {boolean}
*/
function areEqual(o1, o2) {
	// https://stackoverflow.com/a/1144249
	return JSON.stringify(o1) === JSON.stringify(o2);
}

class Handle {
	/**
 * Constructs a Handle. There is no need to create these.
 * These will be created by the StorageManager instance.
 * @param {string} path Path to the file this handle is for.
 * @param {object} initData Inital data if the file needs to be created.
 * @param {boolean} important Whether this file is important.
 * @param {StorageManager} manager Reference to the StorageManager that created this handle.
 */
	constructor(path, initData, important, manager) {
		this.path = path;
		this.initData = initData;
		this.manager = manager;
		this._important = important;
		this._locked = false;
	}

	/**
	* Checks whether the file is important.
	* @returns {boolean}
	*/
	isImportant() {
		return this._important;
	}

	/**
	* Checks whether the file is cached.
	* @returns {boolean}
	*/
	isCached() {
		return this.manager.isCached(this.path);
	}

	/**
	* Toggles the important flag to the opposite of the current state or
	* the state passed in through @param {boolean} [state]
	* @param {boolean} [state] The state to toggle the important flag to.
	* @returns {boolean}
	*/
	toggleImportant(state) {
		if (typeof state !== 'boolean') {
			this._important = !this._important;
		} else {
			this._important = state;
		}
		this.manager.updateImportant(this.path, this._important);
	}

	/**
	* Grants access to the data stored in the file.
	* @param {function} [modify] The function that takes the file's data as its parameter.
	* @returns {Promise}
	*/
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

	/**
	* Purges the file from cache.
	* @returns {Promise}
	*/
	purge() {
		return new Promise((resolve, reject) => {
			this.manager.purgeCached(this.path).then(() => {
				resolve();
			}, (err) => {
				reject(err);
			});
		});
	}

	/**
 * Gets the Handle for a file that is inside of this Handle's directory.
 * Not yet created handles will be created and stored.
 * @param {boolean} [important] Whether this file is important or not.
 * @param {string or STORAGE_TYPE} ... The path to the file to open.
 *    Can be many strings or STORAGE_TYPEs chained after another.
 *    Last string is the filename.
 * @returns {Handle} The created or cached Handle.
 */
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

	/**
	* Shorthand for getting a USER storage handle.
	*/
	getUserHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.USER, ...args);
	}

	/**
	* Shorthand for getting a GUILD storage handle.
	*/
	getGuildHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.GUILD, ...args);
	}

	/**
	* Shorthand for getting a CHANNEL storage handle.
	*/
	getChannelHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.CHANNEL, ...args);
	}

	/**
	* Shorthand for getting a MODULE storage handle.
	*/
	getModuleHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.MODULE, ...args);
	}

	/**
	* @private
	* Locks the handle to avoid data corruption.
	*/
	_lock() {
		this._locked = true;
	}

	/**
	* @private
	* Unlocks the handle.
	*/
	_unlock() {
		this._locked = false;
	}

	/**
	* Checks whether the file is currently locked:
	* @returns {boolean}
	*/
	isLocked() {
		return this._locked;
	}

	/**
	* Waits until the handle is unlocked.
	* @returns {Promise}
	*/
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
	/**
 * Constructs a StorageManager.
 * @param {string} [root] Path to the directory that will be used for storage.
 */
	constructor(root) {
		var storage_path = config.storage_path !== undefined ? config.storage_path : 'data';
		this.root = root !== undefined ? win32ToPosix(root) : win32ToPosix(storage_path);

		this.cache = {};
		this.handles = {};
	}

	/**
 * Gets the Handle for a file.
 * Not yet created handles will be created and stored.
 * @param {boolean} [important] Whether this file is important or not.
 * @param {string or STORAGE_TYPE} ... The path to the file to open.
 *    Can be many strings or STORAGE_TYPEs chained after another.
 *    Last string is the filename.
 * @returns {Handle} The created or cached Handle.
 */
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
	/**
	* Shorthand for getting a USER storage handle.
	*/
	getUserHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.USER, ...args);
	}

	/**
	* Shorthand for getting a GUILD storage handle.
	*/
	getGuildHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.GUILD, ...args);
	}

	/**
	* Shorthand for getting a CHANNEL storage handle.
	*/
	getChannelHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.CHANNEL, ...args);
	}

	/**
	* Shorthand for getting a MODULE storage handle.
	*/
	getModuleHandle(important=false, ...args) {
		if (typeof important !== 'boolean') {
			args.unshift(important);
			important = false;
		}

		return this.getHandle(important, STORAGE_TYPE.MODULE, ...args);
	}

	/**
	* Initializes a file and the directories it is in, if those don't yet exist.
	* @param {string} filePath Path to the file.
	* @param {object} data Initial data the file should hold.
	* @param {boolean} important Whether the file is important or not.
	* @returns {Promise}
	*/
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

	/**
	* Gets the data of a file. If it doesn't exist, the file wil be initialized.
	* If the file isn't already cached, it will be cached.
	* @param {string} path Path to the file.
	* @param {object} initData Initial data the file should hold.
	* @param {boolean} important Whether the file is important or not.
	* @returns {Promise}
	*/
	getData(path, initData={}, important=false) {
		return new Promise((resolve, reject) => {
			var data;

			// file is not cached
			if (!this.isCached(path)) {
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

	/**
	* Saves data to a file.
	* @param {string} path Path to the file.
	* @param {object} data The data the that should get saved.
	* @returns {Promise}
	*/
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

	/**
	* Changes the important status of a cached file. If the file isn't cached,
	* nothing will happen.
	* @param {string} path Path to the file.
	* @param {boolean} state State the important flag should be changed to.
	*/
	updateImportant(path, state) {
		if (this.cache[path] !== undefined) {
			this.cache[path]['important'] = state;
		}
	}

	/**
	* Checks whether a file is cached.
	* @param {string} path Path to the file.
	* @returns {boolean}
	*/
	isCached(path) {
		return this.cache[path] !== undefined;
	}

	/**
	* Checks whether a handle for a file exists.
	* @param {string} path Path to the file.
	* @returns {boolean}
	*/
	hasHandle(path) {
		return this.handles[path] !== undefined;
	}

	/**
	* Removes a file from cache.
	* @param {string} path Path to the file.
	*/
	purgeCached(path) {
		return new Promise((resolve, reject) => {
			log.debug('trying to purge "' + path + '"')
			if (this.isCached(path)) {
				// need to await lock on the handle and then lock if the handle exists
				if (this.hasHandle(path)) {
					var handle = this.handles[path];
					handle.awaitUnlock().then(() => {
						handle._lock();

						// save latest data
						var cached = this.cache[path];
						this.saveData(path, cached.data).then(() => {
							handle._unlock();
							this.cache[path] = undefined;
							resolve();
						}, (err) => {
							log.critical('An error occured while saving "' + path + '"!');
							log.critical(err);
							handle._unlock();
							reject(err);
						});
					});
				} else {
					// no handle that we have to wait on
					var cached = this.cache[path];
					this.saveData(path, cached.data).then(() => {
						this.cache[path] = undefined;
						resolve(err);
					}, (err) => {
						log.critical('An error occured while saving "' + path + '"!');
						log.critical(err);
						reject(err);
					});
				}
			} else {
				log.warning('Can\'t purge "' + path + '" because it\'s not cached!')
				resolve();
			}
		});
	}

	/**
	* Enum object for storagetypes
	* @returns {object}
	*/
	get STORAGE_TYPE() {
		return STORAGE_TYPE;
	}
}

module.exports = new StorageManager();
