const Events = require('events');
/**
 * @description ModuleBaseClass
 */
class Module extends Events {
	/**
	 * @param {string} name Name of the module
	 * @param {string} displayName DisplayName of the module
	 * @param {boolean} nsfw Is the module nsfw?
	 */
	constructor(name, displayName="",nsfw=false) {
		/**Name of the module */
		this.name = name;
		/**Displayed name of the module */
		this.displayName = displayName;
		/**Is the bot nsfw? */
		this.nsfw = nsfw;
	}
	/**
	 * Initialize the Module
	 * @param {State} state The bot-state
	 */
	init(state){
		/**The state the module belongs too */
		this.state = state;
	}
	/**Post Initialize Module */
	postInit(){

	}
	/**Exit the Module */
	exit(){

	}
}

module.exports = Module;