const WeightList = require("../utils/weightlist.js");
module.exports = {
	//Tests or Examples:
	"test": "This is a fucking test message. ${date%utc}",//String
	"test.random": ["Fucking Boop", "Frickin Beep", "Fuck Ching", "Fuck Chong", "Fuck Ping", "Fuck Pong"],//Arrays will be picked from randomly.
	"test.randomWeight": new WeightList([
		{ x: "Mostly fucking boop", y: 2 },
		{ x: "But fucking sometimes also beep", y: 0.5 }
	]),//Test with (x instanceof WeightList)
	//
	"err.common": "Jesus fucking Christ. **errID:** `${errid}`\n`${errMsg}`",
	"err.session": "Your Session was crap. **errID:** `${errid}`\n`${errMsg}`",
	"err.command": "Ah FUCK. **errID:** `${errid}`\n`${errMsg}`"
}