describe('IRC Server Message Parser', function() {
	
	// TODO make setup dynamic	
	require.paths.push('/home/echox/server');
	var parser = require('IRCParser');

	it("should parse :some.host.tld 001 foo :welcome", function() {
		var raw = ":some.host.tld 001 foo :welcome";
		
		var msg = parser.parse(raw);
		
		expect(msg.prefix).toEqual("some.host.tld");
		expect(msg.command).toEqual("001");
		expect(msg.params).toContain("foo");
		expect(msg.params).toContain("welcome");
	});
});
