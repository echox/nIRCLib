describe('IRC Message Validator', function() {
	
	// TODO make setup dynamic	
	require.paths.push('/home/echox/server');
	var parser = require('IRCParser');
	var validator = require('IRCValidator');

	var msg;

	beforeEach(function() {
		msg = new parser.Message();
	});

	it("should accept unknown commands if loose is set to true", function() {

		msg.command = "UNKNOWN";
		
		//TODO cleanup, reset validator		
		validator.loose = true;
		var result = validator.validateWithMsg(msg);
		validator.loose = false;

		expect(result).toEqual("");
	});

	it("shouldn't accept unknown commands if loose is set to false", function() {

		msg.command = "UNKNOWN";
		
		//TODO cleanup, reset validator		
		var loose = validator.loose;
		validator.loose = false;
		var result = validator.validateWithMsg(msg);
		validator.loose = loose;

		expect(result).toEqual("Command 'UNKNOWN' not known");
	});


	it("shouldn't accept empty command messages", function() {

		msg.command = "";
		msg.params.push("foo");

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("No command supplied");
	});

	it("should accept NICK fo^o", function() {
		msg.command = "NICK";
		msg.params.push("fo^o");

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("");
	});

	it("shouldn't accept NICK 8ar", function() {

		msg.command = "NICK";
		msg.params.push("8ar");

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("Supplied parameter is not allowed");
	});

	it("shouldn't accept NICK foo#bar", function() {

		msg.command = "NICK";
		msg.params.push("foo#bar");

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("Supplied parameter is not allowed");
	});

	it("shouldn't accept NICK foo bar", function() {

		msg.command = "NICK";
		msg.params.push("foo");
		msg.params.push("bar");

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("Not enough / too many parameters for NICK");
	});

	it("shouldn't accept NICK without parameters", function() {

		msg.command = "NICK";

		var result = validator.validateWithMsg(msg);

		expect(result).toEqual("Not enough / too many parameters for NICK");
	});

});
