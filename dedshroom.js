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
		var s = fs.statSync(v);
		if(!s.isFile){
			console.error(`Config file "${v}" does not exist`);
			process.exit();
		}
		var cnt = fs.readFileSync(v,{encoding:"utf8"});
		try{
			var cfg = JSON.parse(cnt);
			initData.config = cfg;
		}catch(err){
			console.error("Error on parsing config file\n",err.message);
			process.exit();
		}
	}
};

//Process Arguments
for(var i = 2;i < process.argv.length;i++){
	//Split arguments like "foo=bar" into argBase="foo" and argVal="bar"
	var v = process.argv[i];
	var splitPoint = v.indexOf("=");
	splitPoint = splitPoint == -1 ? v.length : splitPoint;
	var argBase = v.slice(0,splitPoint).trim().toLowerCase();
	var argVal = v.slice(splitPoint+1,v.length).trim();
	//Process Argument
	var argProcessor = argprocessors[argBase];
	if(!argProcessor){
		console.error(`Invalid argument "${argBase}"`);
		process.exit(0);
	}
	argProcessor(argVal);
}