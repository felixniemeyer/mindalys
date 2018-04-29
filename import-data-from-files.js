var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs'); 
var dbWrapper = require('./db-wrapper.js');

var url = 'mongodb://localhost:27017/mindalys';

var directory = "./clean-data/";

MongoClient.connect(url, function(err, client) {
	assert.equal(null, err); 
	db = client.db('mindalys');
	console.log('Successfully connected to db server');

	var waitingFor = 1, successes = 0, failures = 0, allStarted = false;
	var postCallback = function(success) {
		waitingFor -= 1; 
		if(success != undefined) {
			successes += success ? 1 : 0; 
			failures += success ? 0 : 1; 
		}
		if(waitingFor <= 0 && allStarted) {
			client.close(); 
			console.log(`${successes} successes and ${failures} failures`);
		}
	};
	var post = function(db, millisecs, data, user) {
		waitingFor += 1; 
		console.log(`Waiting for ${waitingFor}`);
		dbWrapper.post(db, millisecs, data, "felixn", postCallback); 
	};

	fs.readdir(directory, (err, files) => {
		files.forEach(file => { 
			console.log('processing next file ' + file); 
			millisecs = new Date(file.substr(0,10)).getTime();
			fs.readFile(directory+file, 'utf8', function(err, data) {
				post(db, millisecs, data, "felixn"); 
				console.log(data.substr(0,100)); 
			});
		});
	});
	allStarted = true; 
	postCallback();
});
