const WeightList = require("../utils/weightlist.js");
module.exports = {
	//Tests or Examples:
	"test": "Dies ist eine Test-Naricht. ${date%utc}",//String
	"test.random": ["Biep", "Buup", "Curry", "Wurst", "Eichhörnchen", "Berliner"],//Arrays will be picked from randomly.
	"test.randomWeight": new WeightList([
		{ x: "Meistens Buup", y: 2 },
		{ x: "Aber manchmal auch Biep", y: 0.5 }
	]),//Test with (x instanceof WeightList)
	//
	"err.common": "Ein Fehler ist aufgekommen. **errID:** `${errid}`\n`${errMsg}`",
	"err.session": "Ein Fehler ist in der Sitzung aufgekommen. **errID:** `${errid}`\n`${errMsg}`",
	"err.command": "Ein Fehler ist beim ausführen des Befehls aufgekommen. **errID:** `${errid}`\n`${errMsg}`"
}