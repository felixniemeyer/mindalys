var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var fs = require('fs'); 
var dbWrapper = require('./db-wrapper.js');

var url = 'mongodb://localhost:27017/mindalys';

var directory = "./clean-data/";

MongoClient.connect(url, function(err, client) {
	assert.equal(null, err); 
	db = client.db('mindalys');

	var waitingFor = 1, successes = 0, failures = 0, allStarted = false;
	var postCallback = function(success) {
		waitingFor -= 1; 
		if(success != undefined) {
			successes += success ? 1 : 0; 
			failures += success ? 0 : 1; 
		}
		if(waitingFor < 1 && allStarted) {
			client.close(); 
			console.log(`${successes} successfully imported. ${failures} failures.`);
		}
	};
	var post = function(db, millisecs, data, user) {
		waitingFor += 1; 
		dbWrapper.post(db, millisecs, data, "felixn", postCallback); 
	};

	fs.readdir(directory, (err, files) => {
		var started = 0; 
		var incrementStarted = function(){
			started += 1; 
			if(started == files.length){
				allStarted = true; 
			}
		}
		files.forEach(file => { 
			var date = new Date(file.substr(0,10));
			var millisecs = date.getTime();
			
			fs.readFile(directory+file, 'utf8', function(err, data) {
				post(db, millisecs, data, "felixn"); 
				incrementStarted();
			});
		})
	});
	
	postCallback();
});


