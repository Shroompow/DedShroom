const consts = require('../constants.js');
/**
 * Provides Data about the origin of an Event.
 */
class EventOrigin {
	/**
	 * Constructs an EventOrigin.
	 * @param {Object} originData Data about the origin of the Event.
	 * @param {string|Guild} [originData.guild] The Guild the Event originated from, if any.
	 * @param {string|User} [originData.user] The User the Event originated from, if any.
	 * @param {string|Channel} [originData.channel] The Channel the Event originated from, if any. Will override originData.guild when given a Channel-Object.
	 * @param {boolean} [originData.terminal] Originated from a Terminal? Different origins can still be set to enable command-emulating. Some modules might enable additional log data when true.
	 */
	constructor(originData) {
		if (!originData) return;
		//Set Guild and User first
		this.guild = originData.guild;
		this.user = originData.user;
		//Set Channel afterwards. (Setter depends on Guild or User to be set)
		this.channel = originData.channel;
		/**
		 * Originated from a Terminal?
		 * @type {boolean}
		 */
		this.fromTerminal = originData.terminal;
	}

	get guild() {
		return this._guild;
	}

	set guild(g) {
		if (typeof g === "string") {
			//TODO: Find Guild-Object
		} else {
			this._guild = g;
		}
	}

	get channel() {
		return this._channel;
	}

	set channel(c) {
		if (typeof c === "string") {
			//TODO: Find channel
		} else {
			this._channel = c;
		}
		//TODO: Update this.guild accordingly
	}

	get user() {
		return this._user;
	}

	set user(u) {
		if (typeof u === "string") {
			//TODO: Find User-Object
		} else {
			this._user = u;
		}
	}

	/**
	 * Shorthand for checking channel.type === 'dm'
	 * @returns {boolean}
	 */
	isDM(){
		return this.channel ? (this.channel.type === 'dm') : false;
	}

}