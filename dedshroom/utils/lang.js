const formatter = require("./format.js");
const WeightList = require("./weightlist.js");
module.exports = class Languages {

	constructor(languages, defaultLanguage) {
		this.languages = languages;
		this.defaultLanguage = defaultLanguage;
	}

	/**
	 * Finds a Message.
	 * @param {string} name Name of the Message.
	 * @param {string} lang Use a specific language.
	 */
	get(name, lang = undefined) {
		//Get either specified or default Language and the property name. But in overly complex Syntax which makes it look more professional.
		var _msg = ((_msg = this.languages[lang]) ? _msg : this.defaultLanguage)[name];
		if(Array.isArray(_msg)){
			return _msg[Math.floor(Math.random()*_msg.length)];
		}
		else if(_msg instanceof WeightList){
			return _msg.getWeighted(Math.random());
		}
		return _msg;
	}

	/**
	 * Finds a Message and formats it. (see format())
	 * @param {string} name Name of the Message.
	 * @param {*} env The environment used.
	 * @param {string} lang Use a specific language.
	 */
	getF(name, env={}, lang = undefined) {
		return formatter.format(this.get(name,lang), env);
	}
}