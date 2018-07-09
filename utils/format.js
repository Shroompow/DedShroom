/**
 * Post-Functions
 */
var formatPosts = {
	"int": (input, ...args)=>{
		return parseInt(input,10);
	},
	"float": (input, ...args)=>{
		return parseFloat(input);
	},
	"rnd": (input, ...args)=>{
		var m = parseFloat(args[0]);
		m = isNaN(m) ? 1 : m;
		return Math.round(input*m)/m;
	},
	"flr": (input, ...args)=>{
		var m = parseFloat(args[0]);
		m = isNaN(m) ? 1 : m;
		return Math.floor(input*m)/m;
	},
	"flr": (input, ...args)=>{
		var m = parseFloat(args[0]);
		m = isNaN(m) ? 1 : m;
		return Math.ceil(input*m)/m;
	},
	"mul": (input, ...args)=>{
		var m = parseFloat(args[0]);
		m = isNaN(m) ? 1 : m;
		return input*m;
	},
	"add": (input, ...args)=>{
		var m = parseFloat(args[0]);
		m = isNaN(m) ? 0 : m;
		return input+m;
	},
	"hex": (input, ...args)=>{
		return parseInt(input,10).toString(16);
	},
	"utc": (input, ...args)=>{
		return (new Date(input)).toUTCString();
	},
	"len": (input, ...args)=>{
		if(typeof input === "object"){
			return Object.keys(input).length;
		}else if(typeof input === "string"){
			return input.length;
		}
		return 0;
	}
};

/**
 * Get a property of an environment using a path-string.
 * @param {string} arg The path to take
 * @param {object} env The environment to descend
 * @returns {*} undefined when value doesn't exist in env
 * @private
 */
function formatGetInEnv(arg,env){
	var path = arg.split(".");
	var obj = env;
	//Descend down the object
	for(var key of path){
		obj = obj[key];
		if(obj===undefined){
			return undefined;
		}
	}
	return obj;
}

/**
 * Formats a string.
 * @param {string} str String to be formatted.
 * @param {object} env Environment used for inserting variables.
 * @returns {string} A new formatted string.
 */
module.exports.format = (str, env) => {
	var out = "";
	var fIx = 0;

	for (var i = 0; i < str.length; i++) {
		//Search for injectors starting at fIx not being escaped by an \
		var srchIx = i;
		while (
			str.charAt((srchIx = fIx = str.indexOf("${", srchIx)) - 1) == "\\"
		) {
			srchIx++;
		}
		//Set to end of string if none found
		fIx = fIx != -1 ? fIx : str.length;
		//Add slice str and add to out
		out += str.slice(i, fIx);

		//Check if injector is cutoff or reached string end
		fIx += 2;
		if (fIx + 2 != str.length) {
			//Process injector:

			//Find end of injector
			var fEnd = str.indexOf("}", fIx);
			if (fEnd == -1) {
				//End of injector not found.
				//Return unfinished result
				return out;
			}
			//Get the string containing the injector
			var injectorStr = str.slice(fIx, fEnd);
			//Split into subparts and trim them
			var injectorParts = injectorStr.split("%").map(x => x.trim());

			//Is at least one injectorpart present
			if(injectorParts.length>0&&injectorParts[0]){
				//Get 
				var v = formatGetInEnv(injectorParts[0],env);
				if(v!==undefined){
					for(var i = 1;i < injectorParts.length;i++){
						var postParts = injectorParts[i].trim().split(" ");
						var post = formatPosts[postParts[0].trim()];
						if(post){
							v = post(v,postParts.slice(1));
						}else{
							break;
						}
					}
					out += v;
				}else{
					out += "undefined";
				}
			}else{
				out += "undefined";
			}
			//Skip to end of injector
			fIx=fEnd;
		}

		//Resume after fIx
		i = fIx;
	}

	return out;
}