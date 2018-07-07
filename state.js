const discord = require('discord.js');
const constants = require('./constants.js');
class State {
	constructor(){
		this.modules = {};
		this.guilds = {};
		this.users = {};
		this.sessions = {};
		this.indexes = {};
		this.running = false;
	}
	async start(token){
		if(running)return;

		//Loading indexes
		try{
			var languagesIndex = this.indexes["languages"] = require(constants.FILE_LANGUAGES);
			var modulesIndex = this.indexes["modules"] = require(constants.FILE_MODULES);
		}catch(e){
			console.error("Error on loading Indexes",e.message);
			process.exit();
		}
		this.running = true;
	}
	async end(force){
		if(!running)return;
		//TODO: End procedure
		this.running = false;
	}
}
module.exports = State;