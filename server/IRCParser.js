
function Message() {
	
	this.prefix = null;
	this.command = null;
	this.numCommand = null;
	this.params = new Array();
}

var rgxCommand = /[a-zA-Z]+|[0-9]{3}/;
var rgxPrefix = /:[a-zA-Z0-8\.]+/;

exports.Message = Message;

exports.parse = function (raw) {

	var msg = new Message();
	var parts = raw.split(" ");
	
	//determine prefix
	var hasPrefix = false;
	if (parts[0].substr(0,1) == ":") hasPrefix = true;
	if (hasPrefix) {
		var prefix = parts[0];
		if (prefix.match(rgxPrefix) == prefix) {
			msg.prefix = prefix.substr(1,prefix.length);
		} else {
			// TODO write tests for this!
			throw new Error("Couldn't parse prefix in IRC Message");
		}
	}	

	
	//check for command
	var cmdIdx = 0;
	if (hasPrefix) cmdIdx = 1;

	if (parts[cmdIdx].match(rgxCommand) == parts[cmdIdx]) {
		msg.command = parts[cmdIdx];
	} else {
		throw new Error("Couldn't find command in IRC Message");
	}
	
	for (var paramIdx = (cmdIdx+1) in parts) {
		var part = parts[paramIdx];

		// handle : in parameters
		if (part == ":") continue;
		if (part.substr(0,1) == ":") part = part.substr(1,part.length);

		msg.params.push(part);
	}

	return msg;
}
