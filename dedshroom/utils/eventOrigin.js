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
	 * @param {boolean} [originData.console] Originated from Terminal? Different origins can still be set to enable command-emulating. Some modules might enable additional log data when true.
	 */
	constructor(originData){
		if(!originData)return;
		this.guild = originData.guild;
	}

	get guild(){
		return this._guild;
	}

	set guild(g){
		if(typeof g === 'string'){
			//TODO: Get Guild-Object
		}else{
			this._guild = g;
		}
	}

	
}