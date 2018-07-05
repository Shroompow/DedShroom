/**
 * @description ModuleBaseClass
 */
class Module {
	/**
	 * @param {State} state The Bot-State
	 * @param {string} name Name of the module
	 */
	constructor(state, name) {
		this.state = state;
	}
	/**
	 * @description Initialize Module.
	 */
	async init() {

	}
	/**
	 * @description Called after global initializing finished.
	 */
	postInit() {

	}
	/**
	 * @description Called before bot exits.
	 */
	clearUp() {

	}
	/**
	 * Called when Module gets enabled at a Location.
	 * @param {Location} location The Location where the module has been enabled.
	 */
	onEnable(location) {

	}
	/**
	 * Called when Module gets disabled at a Location.
	 * @param {Location} location The Location where the Module has been disabled.
	 */
	onDisable(location) {

	}
	/**
	 * Called on receiving a Message.
	 * @param {Message} msg 
	 */
	onMsg(msg) {

	}
	/**
	 * Called on receiving a Command.
	 * @param {CommandData} cmd The Command received.
	 */
	onCmd(cmd) {

	}

}

module.exports = Module;