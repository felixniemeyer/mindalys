function FIFO(){
	this.head = [];
	this.tail = [];
}

FIFO.prototype.push = function(element) {
	if(element != undefined) 
		this.head.push(element); 
};

FIFO.prototype.unshift = function(element) {
	if(this.tail.length == 0) {
		this.spill(); 
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
	return this.tail[this.tail.length - 1];
};

FIFO.prototype.forEach = function(callback) {
	for(var i = this.tail.length-1 ; i >= 0; i--) {
		callback(this.tail[i]);
	}
	for(var i = 0; i < this.head.length; i++) {
		callback(this.head[i]);
	}
};

FIFO.prototype.length = function() {
	return this.tail.length + this.head.length; 
}

module.exports = FIFO; 
