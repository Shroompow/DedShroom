const format = require("./format.js");
const eventOrigin = require("./eventOrigin.js");

/**
 * @description CommandData class
 */
class CommandData {
	/**
	 * @param {Command} command The command
	 * @param {string[]} args Array of arguments
	 * @param {EventOrign} origin EventOrigin where command has been emitted
	 * @param {Message} msg Original message
	 * @param {User} [emitter] Emitter of the command
	 */
	constructor(command, args, origin, msg) {
		this.command = command;
		this.args = args;
		this.origin = origin;
		this.msg = msg;
	}
	/**
	 * Parses a CommanData-Object from a string.
	 * @param {string} str String to parse
	 * @param {EventOrigin} origin Origin of command
	 * @returns {EventOrigin|undefined} A new instance of CommandData or undefined if the command could not be parsed.
	 */
	static parse(str, origin) {
		var [name, ...args] = format.argSplit(str);
		if (name) {
			var cmd;
			//TODO: Find command-object
			if (cmd) {
				return new CommandData(cmd, args, origin, str);
			}
		}
		return undefined;
	}
}

class Command {
	constructor(owner, name, nsfw) {
		this.owner = owner;
		this.name = name;
		this.nsfw = nsfw;
	}
}

module.exports.CommandData = CommandData;
module.exports.Command = Command;