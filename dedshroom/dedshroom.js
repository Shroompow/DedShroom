'use-strict';
const fs = require('fs');

/*https://nodejs.org/docs/latest/api/process.html#process_process_argv
Running:
node dedshroom.js fuck the="big duck" "in the ass"
Results in:
[ 'C:\\Program Files (x86)\\nodejs\\node.exe', <- exec location
  'd:\\programming\\discord\\DedShroom\\dedshroom.js', <- file location
  'fuck',
  'the=big duck',
  'in the ass' ]
*/

//Data to initialize bot with
var initData = {};

function loadConfig(f){
	let s = fs.statSync(f);
	if(!s.isFile){
		console.error(`Config file "${f}" does not exist`);
		process.exit();
	}
	let cnt = fs.readFileSync(f,{encoding:"utf8"});
	try{
		let cfg = JSON.parse(cnt);
		initData.config = cfg;
	}catch(err){
		console.error("Error on parsing config file\n",err.message);
		process.exit();
	}
}

//Argument Processors
const argprocessors = {
	help: (v)=>{
		console.log(`Arguments:\ncfg="" Path to config file (Defaults to config.json)`);
		process.exit();
	},
	"?": (v)=>{argprocessors["help"](v)},//Alias for help
	cfg: (v)=>{
		console.log(`Loading config "${v}"`);
		if(!v){
			console.error(`Argument "cfg" needs to be set`);
			process.exit();
		}
		loadConfig(v);
	}
};

//Process Arguments
for(let i = 2;i < process.argv.length;i++){
	//Split arguments like "foo=bar" into argBase="foo" and argVal="bar"
	let v = process.argv[i];
	let splitPoint = v.indexOf("=");
	splitPoint = splitPoint == -1 ? v.length : splitPoint;
	let argBase = v.slice(0,splitPoint).trim().toLowerCase();
	let argVal = v.slice(splitPoint+1,v.length).trim();
	//Process Argument
	let argProcessor = argprocessors[argBase];
	if(!argProcessor){
		console.error(`Invalid argument "${argBase}"`);
		process.exit(0);
	}
	argProcessor(argVal);
}

//PostValidation

if(!initData.config){
	loadConfig("./config.json");
}

if(!initData.config.token){
	console.error('"token" is required in config');
	process.exit();
}

//Launching Bot

console.log("Loading Bot");
const State = require('./state.js');
let state = new State();
console.log("Starting Bot");
state.start().then(console.log).catch(console.error);