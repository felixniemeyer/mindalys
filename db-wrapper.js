var MongoClient = require('mongodb').MongoClient; 

var client; 

exports.getPool = function(success, error){
	if(client) {
		success(client.db('mindalys')); 
	} else {
		MongoClient.connect(
			'mongodb://localhost:27017/mindalys',
			{
				poolSize: 10
			},
			function(err, mongoClient) {
				if(err) {
					error(err); 
				} else {
					client = mongoClient;
					success(client.db('mindalys'));
				}
			}
		);
	}
};

				
//deprecated
exports.post = function(db, time, data, user, readyCallback) {
	posts = db.collection('posts');
	posts.insertOne({
			time: time, 
			data: data, 
			user: user
		},
		{},
		(err, r) => {
			err && console.error("Error when storing post in db: " + err); 
			readyCallback(!err);
		}
	);
};
		
	
