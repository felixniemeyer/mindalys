var https = require('https');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');

var dbWrapper = require('./db-wrapper.js'); 
var PostAnalyzer = require('./post-analyzer.js');
var PostsBuffer = require('./posts-buffer.js');

var db = null;

var options = {
    key: fs.readFileSync('./ssl-cert/key.pem'),
    cert: fs.readFileSync('./ssl-cert/cert.pem'),
    requestCert: false,
    rejectUnauthorized: false
};

function run(mongoDb) { 
	db = mongoDb;

	var app = express();

	app.use(express.static('client/dist'));

	var postRequestCount = 0; 
	app.post('/post', bodyParser.json(), function(req, res) {
		console.log('Received '+ postRequestCount++ +'. post request');
		authorize(req.body.user,
			() => {
				post(
					req.body.user, 
					req.body.book, 	
					req.body.text, 
					req.body.timestamp, 
					() => { res.send('success') },
					() => { res.send('failure') }
				);
			},
			(err) => {
				console.error('Failed to authorize post request: ' + err); 
				res.send('failure');
			}
		);
	});
	
	var analyzeRequestCount = 0; 
	app.post('/analyze', bodyParser.json(), function(req, res) {
		console.log('Received ' + analyzeRequestCount++ + '. analysis request: ' + JSON.stringify(req.body)); 
		authorize(req.body.user, 
			() => {
				analyze(
					req.body.user, 
					req.body.book, 
					req.body.from, 
					req.body.to, 
					req.body.kernelRadius, 
					req.body.stepSize,
					req.body.minFrequencyPeak, 
					req.body.minOccurences,
					(results) => { res.send(JSON.stringify(results) ) },
					(err) => { res.send('error') }
				);
			},
			(err) => {
				console.error('Failed to authorize post request: ' + err); 
				res.send('failure');
			}
		);
	});

	var server = https.createServer(options, app).listen(3000, function(){
		console.log("server started at port 3000");
	});
}

function authorize(user, authorizedCallback, unauthorizedCallback) {
	//TBD
	authorizedCallback(); //authorize 
}

async function analyze(user, book, from, to, kernelRadius, stepSize, minFrequencyPeak, minOccurences, successCb, failureCb) {
	var postsCursor = db.collection('posts').find({
			user: user, 
			book: book, 
			timestamp: {$gt: from - kernelRadius, $lt: to + kernelRadius}
		}).sort({ timestamp: 1});
	var getSteps = calculateSteps(new PostsBuffer(postsCursor), from, to, kernelRadius, stepSize);
	var getBook = db.collection('books').find({
		user: user, 
		book: book
	}).limit(1).next();

	var results = {
		book: await getBook,
		steps: await getSteps,
		extrema: {}
	};
	
	if(results.book != null) {
		normalizeAndFindExtrema(results);
		filterProminentWords(results, minFrequencyPeak, minOccurences); //make threshold a parameter
		successCb(results); 
	} else {
		failureCb("No such book");
	}
}

function filterProminentWords(results, minFreq, minOccs) {
	var minTotalOccurences = minOccs || 10; 
	var minFrequencyPeak = minFreq || 4;
	var step; 
	for(var word in results.book.wordCounts) {
		if(word in results.extrema){
			if(word == "unbestimmten") {
				console.log("DEBUG! found unbestimmten"); 
				console.log("maxValue = " + results.extrema[word].maxValue);
			}
			if(results.extrema[word].maxValue < minFrequencyPeak
				|| results.book.wordCounts[word] < minTotalOccurences) {
				delete results.extrema[word];
				delete results.book.wordCounts[word];
				for(var time in results.steps){
					step = results.steps[time];
					delete step.wordCounts[word];
					delete step.normalizedWordFrequencies[word];
				}
			}
		} else {
			delete results.book.wordCounts[word];
		}
	}
}

function normalizeAndFindExtrema(results) {
	for(var time in results.steps) {
		step = results.steps[time];
		step.normalizedWordFrequencies = {};
		for(var word in step.wordCounts) {
			count = step.wordCounts[word];
			var wordFrequency = (count / step.totalWordCount);
			var bookWordFrequency = results.book.wordCounts[word] / results.book.totalWordCount; 
			var normalizedWordFrequency = wordFrequency / bookWordFrequency; 
			if(word == "unbestimmten") {
				console.log("DEBUG: updated extrema for unbestimmten, wordFrequency = " + wordFrequency); 				console.log("bookfrequ: " + bookWordFrequency);
				console.log("results.book.wordCounts[word] = " + results.book.wordCounts[word]);
			}
			step.normalizedWordFrequencies[word] = normalizedWordFrequency;
			updateExtrema(results.extrema, word, normalizedWordFrequency, time); 
		};
	};
}

function updateExtrema(extrema, word, value, time) {
	if(!(word in extrema)) {
		extrema[word] = {
			minValue: 1,
			minValueTime: time, 
			maxValue: 0,
			maxValueTime: time
		};
	}
	var wordExtrema = extrema[word]; 
	if(value > wordExtrema.maxValue) {
		wordExtrema.maxValue = value;
		wordExtrema.maxValueTime = time; 
	}
	if(value < wordExtrema.minValue) {
		wordExtrema.minValue = value;
		wordExtrema.minValueTime = time; 
	}
}

function calculateSteps(postsBuffer, time, to, kernelRadius, stepSize) {
	return new Promise(function(resolve, reject) {
		calculateStep(postsBuffer, time, to, kernelRadius, stepSize, {}, resolve, reject);
	});	
}

function calculateStep(postsBuffer, time, to, kernelRadius, stepSize, steps, resolve, reject){
	postsBuffer.getPostsInRange(time - kernelRadius, time + kernelRadius).then(
		posts => {
			steps[time] = {
				wordCounts: {},
				totalWordCount: 0
			};
			posts.forEach(post => { 
				addWeightedPostStats(steps[time], post, time, kernelRadius) 
			});
			if(time + stepSize < to){
				calculateStep(postsBuffer, time + stepSize, to, kernelRadius, stepSize, steps, resolve, reject)
			} else {
				resolve(steps);
			}
		}
	);
}

function addWeightedPostStats(step, post, time, kernelRadius) {
	var normedDistance = Math.min(1, Math.abs(time - post.timestamp) / kernelRadius);
	var weight = 1 - Math.pow(normedDistance, 2);
	if(weight > 0) {
		for(var word in post.wordCounts) {
			var count = post.wordCounts[word];
			if(word in step.wordCounts) {
				step.wordCounts[word] += count*weight; 
			} else {
				step.wordCounts[word] = count*weight
			}
		};
		step.totalWordCount += post.totalWordCount*weight; 
	}
}

function post(user, book, text, timestamp, successCb, failureCb) {
	var postInfo = PostAnalyzer.count(text); 
	db.collection('posts').insertOne({
			user: user, 
			book: book, 
			text: text,
			timestamp: timestamp,
			wordCounts: postInfo.wordCounts,
			totalWordCount: postInfo.totalWordCount,
		},
		{}, 
		(err, r) => {
			if(err) {
				console.error('Error when persisting the post in mongodb: ' + err); 
				failureCb();
			} else {
				var increments = {
					totalWordCount: postInfo.totalWordCount
				}
				for(key in postInfo.wordCounts) {
					increments["wordCounts."+key] = postInfo.wordCounts[key];
				}
				db.collection('books').updateOne(
					{
						user: user, 
						book: book
					},
					{
						$inc: increments
					},
					{
						upsert: true
					},
					(err, res) => {
						if(err){
							console.log("Err on incrementing book values: " + err);
						} else {
							successCb();
						}
					}
				);
			}
		}
	);
}

dbWrapper.getPool(
	run,
	(err) => {
		console.error('Could not get a db connection ' + err); 
	}
);
