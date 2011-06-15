describe('IRC Client Message Parser', function() {
	
	// TODO make setup dynamic	
	require.paths.push('/home/echox/server');
	var parser = require('IRCParser');

	it("shouldn't parse 1234 foo", function() {
		var raw = "1234 foo";
		expect(function() {parser.parse(raw)} ).toThrow("Couldn't find command in IRC Message");
	});
	
	it("shouldn't parse command234 foo", function() {
		var raw = "command234 foo";
		expect(function() {parser.parse(raw)} ).toThrow("Couldn't find command in IRC Message");
	});


	it("should parse NICK foo", function() {
		var raw = "NICK foo";
		
		var msg = parser.parse(raw);
		
		expect(msg.prefix).toBeNull();
		expect(msg.command).toEqual("NICK");
		expect(msg.params).toContain("foo");
	});
	
	it("should parse nick 123fo`^o", function() {
		var raw = "nick 123fo`^o";
		
		var msg = parser.parse(raw);
		
		expect(msg.prefix).toBeNull();
		expect(msg.command).toEqual("nick");
		expect(msg.params).toContain("123fo`^o");
	});

	it("should parse USER foo * * : 1234", function() {
		var raw = "USER foo * * : 1234";
		
		var msg = parser.parse(raw);
		
		expect(msg.prefix).toBeNull();
		expect(msg.command).toEqual("USER");
		expect(msg.params).toContain("*");
		expect(msg.params).toContain("1234");
	});

});
