const WeightList = require("../utils/weightlist.js");
module.exports = {
	//Tests or Examples:
	"test": "This is a test message. ${date%utc}",//String
	"test.random": ["Boop", "Beep", "Ching", "Chong", "Ping", "Pong"],//Arrays will be picked from randomly.
	"test.randomWeight": new WeightList([
		{ x: "Mostly boop", y: 2 },
		{ x: "But sometimes also beep", y: 0.5 }
	]),//Test with (x instanceof WeightList)
	//
	"err.common": "An Error occured. **errID:** `${errid}`\nError Message: `${errMsg}`",
	"err.session": "An Error occured in the Session. **errID:** `${errid}`\nError Message: `${errMsg}`",
	"err.command": "An Error occured while performing the Command. **errID:** `${errid}`\nError Message: `${errMsg}`"
}