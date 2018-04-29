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
			readyCallback(!!err);
		}
	);
};
		
	
