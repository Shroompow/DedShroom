const discord = require('discord.js');
class State {
	constructor(){
		this.modules = {};
		this.guilds = {};
		this.users = {};
		this.sessions = {};
		this.running = false;
	}
	async start(token){
		if(running)return;

		//TODO: Load/Initialize/MumboJumbo
		this.running = true;
	}
	async end(force){
		if(!running)return;
		//TODO: End procedure
		this.running = false;
	}
}
module.exports = State;