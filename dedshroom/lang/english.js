module.exports = {
	"test" : "This is a test message. ${date%utc}",
	"err.common" : "An Error occured. **errID:** `${errid}`\nError Message: `${errMsg}`",
	"err.session" : "An Error occured in the Session. **errID:** `${errid}`\nError Message: `${errMsg}`",
	"err.command" : "An Error occured while performing the Command. **errID:** `${errid}`\nError Message: `${errMsg}`"
}