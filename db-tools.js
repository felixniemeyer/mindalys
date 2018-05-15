var ArgParser = require('./arg-parser.js');
var dbw = require('./db-wrapper.js');

var args = ArgParser.parse(process.argv.splice(2), {
	'clean-up': {name: 'cleanUp'},
	'count-posts': {name: 'countPosts'},
	'book-info': {name: 'bookInfo'}
});

dbw.getPool(
	async function(db) {
		if(args.cleanUp){
			console.log("cleaning db...");
			await db.collection('posts').remove({});	
			await db.collection('books').remove({});	
			console.log("db cleaned");
		}
		if(args.bookInfo){
			args.countPosts = true; 
			console.log("retrieving book info");
			
			var books = await db.collection('books').find({}).toArray();
			for(var i = 0; i < books.length; i++){
				console.log(`Book ${i+1}: ${books[i].user} ${books[i].book} ${books[i].totalWordCount}`); 
			}
		}
		if(args.countPosts){
			console.log("counting posts...");
			var counts = {};
			var next;
			var cursor = db.collection('posts').find({});
			while(await cursor.hasNext()){
				next = await cursor.next(); 
				if(counts[next.user] == undefined){
					counts[next.user] = {};
				}
				if(counts[next.user][next.book] == undefined){
					counts[next.user][next.book] = 1;
				} else {
					counts[next.user][next.book] += 1; 
				}
			}
			console.log(counts);
		}
			
	}
);
			
