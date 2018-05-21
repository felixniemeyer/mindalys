var FIFO = require('../fifo.js');

var queue = new FIFO(); 
var allRight = true; 
queue.push(1);
queue.push(2); 
allRight = (queue.unshift() == 1); 
queue.push(3); 
allRight = (queue.unshift() == 2); 
queue.push(4); 
allRight = (queue.unshift() == 3); 
queue.push(5); 
queue.push(6); 
allRight = (queue.unshift() == 4); 
allRight = (queue.unshift() == 5); 
allRight = (queue.unshift() == 6); 
allRight = (queue.unshift() == undefined); 

var queue = new FIFO(); 
queue.push(1);
queue.push(2); 
allRight = (queue.unshift() == 1); 
allRight = (queue.unshift() == 2); 
allRight = (queue.unshift() == undefined); 
allRight = (queue.unshift() == undefined); 
queue.push(3); 
allRight = (queue.unshift() == 3); 
allRight = (queue.unshift() == undefined); 
queue.push(4); 
allRight = (queue.unshift() == 4); 

if(allRight) 
	console.log("Tests passed"); 
else
	console.log("Tests failed"); 


