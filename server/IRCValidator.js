

// default behaviour if command is not known
//TODO cleanup loose usage
exports.loose = true;

var commands = new Array();

commands["NICK"] = val_nick;

var rgxNick = /[a-zA-Z].[a-zA-Z0-9-\[\]\\`\^\{\}]*/;

function val_nick(msg) {
	
	if (msg.params.length != 1) return "Not enough / too many parameters for NICK";
	if (msg.params[0].match(rgxNick) != msg.params[0]) return "Supplied parameter is not allowed";
	
	return "";
}


exports.validate = function (msg) {

	//TODO cleanup
	if (validateMsg(msg) == "") {
		return true;
	} else {
		return false;
	}
}

exports.validateWithMsg = function (msg) {

	return validateMsg(msg);
}

function validateMsg(msg) {

	//TODO check message for the message prototype
	
	if (msg.command == "" || msg.command == null) {
		return "No command supplied";
	}

	//TODO check if command exists, cleanup this exception handling
	try {
		return commands[msg.command.toUpperCase()](msg);
	} catch (e) {
		if (e.type == "undefined_method") {
			if (exports.loose == true) {
				return "";
			} else {
				return "Command '"+ msg.command +"' not known";
			}
		} else {
			throw new e;
		}
	}
}
