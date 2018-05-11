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

	app.post('/post', bodyParser.json(), function(req, res) {
		console.log('Received post request: ' + JSON.stringify(req.body));
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
	
	app.post('/analyze', bodyParser.json(), function(req, res) {
		console.log('Received analysis request: ' + JSON.stringify(req.body)); 
		authorize(req.body.user, 
			() => {
				analyze(
					req.body.user, 
					req.body.book, 
					req.body.from, 
					req.body.to, 
					req.body.kernelRadius, 
					req.body.stepSize,
					(results) => { res.send(JSON.stringify(results) ) },
					(err) => { res.send('error') }
				);
				res.send('{}');
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

async function analyze(user, book, from, to, radius, stepSize, successCb, failureCb) {
	var postsCursor = db.collection('posts').find({
		$query: {
			user: user, 
			book: book, 
			timestamp: {$gt: from - kernelRadius, $lt: to + kernelRadius}
		},
		$orderby: {
			timestamp: 1
		}
	}); 
	var getSteps = calculateSteps(new PostsBuffer(postCursor), from, to, radius, stepSize);
	var getBook = db.collection('books').findOne({
		user: user, 
		book: book
	});

	var results = {
		book: await getBook,
		steps: await getSteps,
		extrema: {}
	};
	normalizeAndFindExtrema(results);
	filterProminentWords(results, threshold);
	successCb(results); 
}

function normalizeAndFindExtrema(results) {
	results.steps.forEach((time, step) => {
		step.wordCounts.forEach((word, wordInfo) => {
			var wordFrequency = (wordInfo.count / step.totalCount);
			var bookWordFrequency = book.wordCounts[word] / book.totalWordCount; 
			var normalizedWordFrequency = wordFrequency / bookWordFrequency; 
			results.steps.normalizedWordFrequencies[word] = normalizedWordFrequency;
			updateExtrema(results.extrema, word, normalizedWordFrequency, time); 
		});
	});
}

function updateExtrema(extrema, word, value, time) {
	if(!(word in results.extrema)) {
		results.extrema[word] = {
			minValue: 0,
			minValueTime: time, 
			maxValue: 0,
			maxValueTime: time
		};
	}
	var wordExtrema = results.extrema[word]; 
	if(value > wordExtrema.maxValue) {
		wordExtrema.maxValue = value;
		wordExtrema.maxValueTime = time; 
	}
	if(value < wordExtrema.minValue) {
		wordExtrema.maxValue = value;
		wordExtrema.maxValueTime = time; 
	}
}

function calculateSteps(posts, time, to, radius, stepSize) {
	var resolve, reject; 
	var promise = Promise(function(res, rej) {
		resolve = res; 
		reject = rej; 
	});	
	calculateStep(posts, time, to, radius, stepSize, {}, resolve, reject);
	return promise; 
}

function calculateStep(posts, time, to, radius, stepSize, steps, resolve, reject){
	var step = {
		wordCount: {},
		totalWordCount: 0
	};
	posts.getPostsInRange(
		time - radius, 
		time + radius, 
		posts => {
			posts.forEach(post => { 
				addWeightedPostStats(step, post, time, radius) 
			});
			steps[time] = step;
			if(time + stepSize < to){
				calculateStep(time + stepSize, to, radius, stepSize, steps, finished, aborted)
			} else {
				resolve(steps);
			}
		}
	);
	//use nextTick => don't make stack grow	
}

function addWeightedPostStats(step, post, time, radius) {
	var distance = Math.min(1, Math.abs(time - post.timestamp) / radius);
	var weight = 1 - Math.pow(distance / radius, 2);
	post.wordCounts.forEach((word, count) => {
		if(word in results.wordInfo) {
			step.wordCount[word] += count*weight; 
		} else {
			step.wordCount[word] = count*weight
		}
		step.totalWordCount += post.totalWordCount*weight; 
	}
}

function post(user, book, text, timestamp, successCb, failureCb) {
	var postInfo = PostAnalyzer.count(text); 
	console.log(postInfo); 
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
				successCb();
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
