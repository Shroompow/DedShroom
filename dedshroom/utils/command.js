/**
 * @description Command class
 */
class CommandData {
	/**
	 * 
	 * @param {string} name Name of the command
	 * @param {string[]} args Array of arguments
	 * @param {Location} location Location where command has been emitted
	 * @param {User} emitter Emitter of the command
	 * @param {Message} msg Original message
	 */
	constructor(name,args,location,emitter,msg){
		Object.assign(this,{
			name:name,
			args:args,
			location:location,
			emitter:emitter,
			msg:msg
		});
	}
}

module.exports = CommandData;