const Events = require('events');
/**
 * @description ModuleBaseClass
 */
class Module extends Events {
	/**
	 * @param {State} state The Bot-State
	 * @param {string} name Name of the module
	 */
	constructor(state, name,nsfw=false) {
		this.state = state;
		this.name = name;
		this.nsfw = nsfw;
	}
}

module.exports = Module;