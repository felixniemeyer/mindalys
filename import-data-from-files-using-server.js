var https = require('https');
var request = require('request');
var fs = require('fs'); 

var ArgParser = require('./arg-parser.js');

var args = ArgParser.parse(
	process.argv.slice(2), 
	{
		'-d': {name: 'directory', expectValue: true, defaultValue: './clean-data/'},
		'-u': {name: 'user', expectValue: true, defaultValue: 'felixn'},
		'-b': {name: 'book', expectValue: true, defaultValue: 'journal'}
	}
);

var requestOptions = { 
	host: 'localhost',
	method: 'POST',
	path: '/post',
	port: '3000', 
	rejectUnauthorized: false,
	headers:{
		'Content-Type': 'application/json',
	}
};
requestOptions.agent = new https.Agent(requestOptions);

console.log(args); 

function run(){
	fs.readdir(args.directory, (err, files) => {
		if(err) {
			console.log('Error when reading directory: ' + err); 
		} else {
			var i = 0; 
			files.forEach(function(file){ 
				var date = new Date(file.substr(0,10));
				var millisecs = date.getTime();
				fs.readFile(args.directory + file, 'utf8', (err, text) => {
					console.log(++i);
					post(text, millisecs); 
				});
			});
		}
	});
}

function post(text, timestamp) {
	return new Promise(function(resolve, reject) {
		var postData = JSON.stringify({
			user: args.user,
			book: args.book,
			text: text,
			timestamp: timestamp
		});
		var options = Object.assign(
			{
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': postData.length
				},
				path: '/post',
				url: 'https://localhost:3000/post'
			},
			requestOptions
		);
		console.log(options); 
		var req = new https.request(options, function (res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('BODY: ' + chunk);
			});
		});

		req.write(postData); 
		req.end();
	});
}

run();
