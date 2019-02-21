var FIFO = require('./fifo.js'); 

function PostsBuffer(postsCursor) {
	this.cursor = postsCursor; 
	this.posts = new FIFO();
	this.latestDate = 0; 
	this.allRead = false; 
}

PostsBuffer.prototype.getPostsInRange = function(from, to) {
	var that = this; 
	return new Promise(async function(resolve, reject){
		await that.loadPostsUntil(to); 
		//that.clearPostsEarlierThan(from); //disable for debug
		resolve(that.posts); 
	});
};

PostsBuffer.prototype.loadPostsUntil = async function(to){
	while(!this.allRead && this.latestDate <= to){
		if(!this.cursor.isClosed() && (await this.cursor.hasNext())){
			var latestPost = await this.cursor.next();
			this.posts.push(latestPost);
			this.latestDate = latestPost.timestamp;
		}else{
			this.allRead = true; 
			break; 
		}
	} 
};

PostsBuffer.prototype.clearPostsEarlierThan = function(t){
	while(this.posts.peakTail() != undefined && this.posts.peakTail().timestamp < t){
		this.posts.unshift();
	}
};

module.exports = PostsBuffer;
