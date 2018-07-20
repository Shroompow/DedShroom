const discord = require('discord.js');
const constants = require('./constants.js');
const logging = require('./utils/logging.js');
const Languages = require('./utils/lang.js');

const log = logging.get("State");

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
		return new Promise((resolve,reject)=>{
			if(this.running){resolve();return;}
			log.info("Starting State");
			//Loading indexes
			let languagesIndex;
			let modulesIndex;
			try{
				log.info("Loading LanguageIndex");
				languagesIndex = this.indexes["languages"] = require(constants.FILE_LANGUAGES);
				log.info("Loading ModuleIndex");
				modulesIndex = this.indexes["modules"] = require(constants.FILE_MODULES);
			}catch(e){
				log.critical("Error on loading Indexes",e.message);
				reject(e);
				return;
			}

			try{
				log.info("Loading Languages");
				//Processing LanguageIndex
				let defaultLanguage = "english";
				let languages = {};
				for(let k in languagesIndex){
					//hasOwnProperty to check if the property wasn't inherited from a baseclass
					if(languagesIndex.hasOwnProperty(k)){
						if(k=="default"){
							defaultLanguage = languagesIndex[k];
						}else{
							languages[k] = require(constants.DIR_LANG+languagesIndex[k]);
						}
					}
				}
				this.lang = new Languages(languages,languages[defaultLanguage]);
			}catch(e){
				reject(e);
				return;
			}

			try{
				log.info("Loading Modules");
				//Processing ModuleIndex
				for(let k in modulesIndex){
					//hasOwnProperty to check if the property wasn't inherited from a baseclass
					if(modulesIndex.hasOwnProperty(k)){
						let mx = modulesIndex[k];
						let mclass = require(constants.DIR_MODULES+mx.name);
						this.modules[mx.name] = new mclass(mx.name,mx.displayName,mx.nsfw);
					}
				}
			}catch(e){
				reject(e);
				return;
			}

			log.info("Initializing Modules");
			for(let k in this.modules){
				this.modules[k].init(this);
			}

			log.info("PostInitializing Modules")
			for(let k in this.modules){
				this.modules[k].postInit();
			}

			this.running = true;
			resolve(this);
		});
	}
	/**
	 * Tries to exit the BotState.
	 * Modules and Sessions will be terminated.
	 * @param {boolean} force Forces the bot to terminate. This might result in data loss.
	 */
	exit(force=false){
		return Promise((resolve)=>{
			if(!this.running){resolve();}

			log.info(`Exiting State (force:${force})`);

			if(!force || true){
				for(var k in this.modules){
					this.modules[k].exit();
				}
				this.modules = {};
			}else{
				//TODO: Force behaviour.
			}

			this.running = false;
			resolve();
		});
	}
}
module.exports = State;