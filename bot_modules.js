module.exports = [
	/*
	Structure:

	{name:"",displayName:"",nsfw:false,cmds:{
		"command_name": {enable_dm:true,disable_text:false,nsfw:false}
	}}

	( * = required )

	*name:
		Name of the module-file.
	displayName:
		Displayed Name of the module.
		If not set, module will be invisible.
	nsfw:
		Is the module NSFW-only?
	commands:
		The modules commands.
		enable_dm:
			Enables in direct messages
		disable_txt:
			Disable in guild text channels
		nsfw:
			Is the command NSFW-only?
	*/
]