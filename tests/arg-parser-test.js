var ArgParser = require('../arg-parser.js')();
var argParser = new ArgParser({
	'-o': {name: 'option'},
	'-n': {name: 'name', expectValue: true},
	'--email': {name: 'email', expectValue: true},
	'--verbose': {name: 'verbose'},
	'-d': {name: 'directory', expectValue: true, defaultValue: '/usr/bin'},
	'-g': {name: 'global'},
	'-h': {name: 'host', expectValue: true}
});

var args = argParser.parse(['first', 'two', '-o', '-n', 'name', '-g', '--verbose', '--email', 'f@g.com']); 

var expectedArgs = {
	option: true, 
	name: 'name', 
	email: 'f@g.com',
	verbose: true, 
	global: true, 
	directory: '/usr/bin',
	host: undefined
};

var allPassed = true; 
for(key in expectedArgs) {
	allPassed = allPassed && (expectedArgs[key] == args[key]);
}

if(allPassed)
	console.log('Tests passed');
else
	console.log('Tests failed');

