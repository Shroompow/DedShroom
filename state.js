const discord = require('discord.js');
const constants = require('./constants.js');
class State {
	/**
	 * Constructs State
	 */
	constructor(){
		/**All modules stored as name => Module */
		this.modules = {};
		/**All known guilds stored as guildID => Guild */
		this.guilds = {};
		/**All known users stored as userID => User */
		this.users = {};
		/**All active sessions stored as sessionID => Session */
		this.sessions = {};
		this.indexes = {};
		/**All languages stored as name => {} */
		this.languages = {};
		/**Name of the default language */
		this.defaultLanguage = "";
		/**Is the state running? */
		this.running = false;
	}
	/**
	 * Starts the BotState.
	 * This includes loading Indexes, Languages, Modules, etc.
	 * And initializing them.
	 * @param {string} token The token to login with
	 */
	start(token){
		return Promise((resolve,reject)=>{
			if(running){resolve();return;}
			console.log("Starting State");
			//Loading indexes
			var languagesIndex;
			var modulesIndex;
			try{
				console.log("Loading LanguageIndex");
				languagesIndex = this.indexes["languages"] = require(constants.FILE_LANGUAGES);
				console.log("Loading ModuleIndex");
				modulesIndex = this.indexes["modules"] = require(constants.FILE_MODULES);
			}catch(e){
				console.error("Error on loading Indexes",e.message);
				reject();
				return;
			}

			try{
				console.log("Loading Languages");
				//Processing LanguageIndex
				for(var k in languagesIndex){
					//hasOwnProperty to check if the property wasn't inherited from a baseclass
					if(languagesIndex.hasOwnProperty(k)){
						if(k=="default"){
							this.defaultLanguage = languagesIndex[k];
						}else{
							this.languages[k] = require(constants.DIR_LANG+languagesIndex[k]);
						}
					}
				}
			}catch(e){
				console.error(`Error on loading language-file`,e.message);
				reject();
				return;
			}

			try{
				console.log("Loading Modules");
				//Processing ModuleIndex
				for(var k in modulesIndex){
					//hasOwnProperty to check if the property wasn't inherited from a baseclass
					if(modulesIndex.hasOwnProperty(k)){
						var mx = modulesIndex[k];
						var mclass = require(constants.DIR_MODULES+mx.name);
						this.modules[mx.name] = new mclass(mx.name,mx.displayName,mx.nsfw);
					}
				}
			}catch(e){
				console.error(`Error on loading module`,e.message);
				reject();
				return;
			}

			console.log("Initializing Modules");
			for(var k in this.modules){
				this.modules[k].init(this);
			}

			console.log("PostInitializing Modules")
			for(var k in this.modules){
				this.modules[k].postInit();
			}

			this.running = true;
			resolve();
		});
	}
	/**
	 * Tries to exit the BotState.
	 * Modules and Sessions will be terminated.
	 * @param {boolean} force Forces the bot to terminate. This might result in data loss.
	 */
	exit(force=false){
		return Promise((resolve)=>{
			if(!running){resolve();}

			console.log(`Exiting State (force:${force})`);

			if(!force){
				for(var k in this.modules){
					this.modules[k].exit();
				}
				this.modules = {};
			}

			this.running = false;
			resolve();
		});
	}
}
module.exports = State;