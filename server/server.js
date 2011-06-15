
function Config() { 
	this.hostname = "localhost";
	this.port = "6667";
}

var net = require('net');
var util = require('util');

function initCommands() {
	
	var userCommands = new Array();

	userCommands["NICK"] = cmd_NICK;
	userCommands["USER"] = cmd_USER;
	userCommands["MODE"] = cmd_MODE;
	userCommands["JOIN"] = cmd_JOIN;
	userCommands["PRIVMSG"] = cmd_PRIVMSG;

	return userCommands;

	function cmd_NICK(user, cmd) {
		var oldNick = user.nick;
		var nick = cmd.parameters[0];
			for (var i in userPool) {
				var tmpUser = userPool[i];
				if (tmpUser.nick == nick) {
					user.msg(nick + ":Nickname is already in use.",433);
					return;
				}
			}
		user.nick = nick;
		debug.log("["+oldNick+"] nick set to " + user.nick);
		if (user.connected == false && user.checkInitialized() == true) {
			welcome(user);
		}
	}

	function cmd_USER(user, cmd) {
		var parts = cmd.parameters;
		user.fullname = parts[3].substr(1,parts[3].length);
		debug.log("["+ user.nick +"] realname set to " + user.fullname);
		user.host = parts[2];
		debug.log("["+ user.nick +"] userhost set to " + user.host);
		
		// check if user is initialized
		if (user.checkInitialized() == true) {
			welcome(user);
		}
	}

	function cmd_MODE(user, cmd) {
		debug.log("modes not yet implemented");
	}

	function cmd_JOIN(user, cmd) {
		var chan = cmd.parameters[0].substring(1,cmd.parameters[0].length);
		channels[chan] = new Channel(chan);
		channels[chan].join(user);
	}

	function cmd_PRIVMSG(user, cmd) {
		var channel = cmd.parameters[0].substring(1,cmd.parameters[0].length);
		var msg = cmd.parameters[1].substring(1,cmd.parameters[1].length);
		channels[channel].msg(user, msg);
	}
}

function Stats() {
	
	this.users = 0;
	this.invUsers = 0;
	this.servers = 1;
}

function init() {

}

function Debug() {
	
	this.debug = true;
	this.log = log;

	function log(msg) {
		if (this.debug ==true) {
			util.log(msg);
		}
	}
}

function chop(str) {
	return str.substr(0,str.length-2);
}


function User() {

	this.nick = "";
	this.fullname = "";
	this.host = "";
	this.socket = "";
	this.connected = false;
	this.modes = new Array();
	
	this.msg = msg;
	this.checkInitialized = checkInitialized;

	function msg(msg, num) {
		var out = ":localhost " + num + " " + this.nick + " " + msg + "\r\n";
		this.socket.write(out);
		util.print("> [" + this.nick + "] " + out);
	}

	this.write = write;
	function write(msg) {
		this.socket.write(msg);
		util.print("> ["+ this.nick +"] " + msg);
	}
	
	function addMode(mode) {
		this.modes.push(mode);
	}

	function delMode(mode) {
		for (var i in this.modes) {
			if (modes[i] == mode) {
				modes.slice(i,1);
			}
		}
	}

	function checkInitialized() {
		if (	this.nick != "" &&
			this.host != "") {
			return true;
		} else {
			return false;
		} 
	}
}

function Channel(name) {

	this.name = name;
	this.topic = "default channel topic";
	this.users = new Array();

	this.join = join;
	this.part = part;
	this.msg = msg;

	function join(user) {
		this.users.push(user);
		//TODO send join messages
		
		user.msg(":"+this.topic, 332);
		user.msg("= #" + this.name + " :" + user.nick, 353);
		user.msg("#" + this.name + " = :End of /NAMES list.", 366);
	}

	function part(user) {
		//TODO send part messages
	}

	function msg(user, msg) {
		for (var i in this.users) {
			userPool[i].write(":"+user.nick + " PRIVMSG #" + this.name + " :" + msg);
		}
	}


}

function Command(msg) {

	var parsed = msg.split(" ");	

	this.command = parsed[0];
	this.parameters = parsed.slice(1,parsed.length);

	return this;
}

function handle(user, cmd) {

	if (uCmd[cmd.command] != null) {
		uCmd[cmd.command](user, cmd);
	}

	if (line.substr(0,4) == "PING") {
		reply = line.substr(5,line.length);
	//	user.write("PONG " + reply + "\r\n");
		user.write(":" + config.hostname + " PONG " + reply + " " + user.nick + "\r\n");
	}

}

var server = net.createServer(function (stream) {
	stream.setEncoding('ascii');

  var user = new User();

  stream.on('connect', function () {
	debug.log("new connection from " + stream.remoteAddress);
	user.socket = this;
  });

  stream.on('data', function (data) {

	var lines = data.split("\r\n");

	for (var i in lines) {
		line = lines[i];

		if (line != "") {
			util.print("< ["+ user.nick + "] " + line + "\r\n");
			var com = Command(line);
			handle(user, com);		
		}
	}

  });

  stream.on('end', function () {
	debug.log("connection closed for " + stream.remoteAddress);
	for (var i in userPool) {
		var tmpUser = userPool[i];
		if (tmpUser.nick == user.nick) {
			userPool.splice(i,1);
		}
	}
	debug.log("removed user " + user.nick);
	user = null;
    stream.end();
  });

});

function welcome(user) {

	user.msg(":welcome", "001");
	user.msg(":There are "+ stats.users +" users and "+ stats.invUsers +" invisible on "+ stats.servers +" servers", 251);

	user.connected = true;
	userPool.push(user);
	debug.log("user fully connected, adding to pool...");

	//TODO cleanup stats
	stats.users = userPool.length;
}

function cleanup() {
}

var config = new Config();
var debug = new Debug();

var userPool = new Array();
var channels = new Array();
var stats = new Stats();

var uCmd = initCommands();

server.listen(config.port, config.hostname);
debug.log("server initialized");
//setInterval(cleanup, 30000);
