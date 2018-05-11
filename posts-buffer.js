// TBD (bisher ist der Buffer synchronous) 
	// Ok, die Idee ist, dass der Buffer für die nächsten steps gegebenenfalls schonmal die datenbankanfragen durchführt. 
	// So findet die Berechnung in JS gleichzeitig mit den Datenbankanfragen statt
	// Außerdem ist es so: der Puffer weiß nicht, wie viele nexts für den nächsten step notwendig sind. 
	// Wenn für einen Step 8 neue posts notwendig sind, 
	// Dann soll der Puffer immer gleich einen Haufen auf einmal anfragen

function FIFO(){
	this.head = [];
	this.tail = [];
}

FIFO.prototype.push = function(element) {
	this.head.push(element); 
};

FIFO.prototype.unshift = function(element) {
	if(this.tail.length == 0) {
		if(this.head.length == 0) {
			return undefined; 
		} else {
			this.spill(); 
		}
	}
	return this.tail.pop(); 
};

FIFO.prototype.spill = function(element) {
	var element; 
	while(undefined != (element = this.head.pop())) {
		this.tail.push(element);
	}
};

FIFO.prototype.peakTail = function(element) {
	if(this.tail.length == 0) {
		this.spill()
	}
	this.tail[this.tail.length - 1];
};

FIFO.prototype.forAllInRange = function(from, to, callback) {
	for(var i = this.tail.length-1 ; i >= 0; i--) {
		callback(this.tail[i]);
	}
	for(var i = 0; i < this.head.length; i++) {
		callback(this.head[i]);
	}
};

function PostsBuffer(postsCursor) {
	this.cursor = postsCursor; 
	this.posts = new FIFO();
	this.latestDate = 0; 
}

PostsBuffer.prototype.setWindow = async function(from, to){
	return new Promise(function(resolve, reject){
		await this.loadPostsUntil(to); 
		resolve(this.posts); 
	});
};

PostsBuffer.prototype.loadPostsUntil = async function(to){
	while(this.latestDate <= to && await this.cursor.hasNext()){
		var latestPost = await this.cursor.next();
		this.posts.push(latestPost) 
		this.latestDate = latestPost.timestamp;
	}
};

module.exports = PostsBuffer;
