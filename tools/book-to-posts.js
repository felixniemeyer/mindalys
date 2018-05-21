var fs = require('fs'); 
var readline = require('readline');

var ArgParser = require('../arg-parser.js')(); 
var argParser = new ArgParser({
	'-b': {name: 'bookName', expectValue: true},
	'-f': {name: 'file', expectValue: true},
	'-o': {name: 'outputFolder', expectValue: true},
	'--start-date': {name: 'startDate', expectValue: true, defaultValue: '2017-01-01'},
	'--help': {name: 'showHelp'}
});
var args = argParser.parse(process.argv);

var from = (new Date(args.startDate)).getTime(); 
var millisecsPerDay = 24*60*60*1000; 

Date.prototype.yyyy_mm_dd = function() {
	var mm = this.getMonth() + 1; 
	var dd = this.getDate();

	return [
		this.getFullYear(),
		(mm>9 ? '' : '0') + mm,
		(dd>9 ? '' : '0') + dd
	].join('-');
};

function writeLinesToPostFile(i, lines){
	var date = new Date(from + millisecsPerDay * i); 
	var file = args.outputFolder + date.yyyy_mm_dd() + "-" + args.bookName + "-page-" + i + ".txt";
	fs.writeFile(file, lines.join('\n'), function(err){
		if(err) {	
			console.log("Error writing file: " +err); 
		}
	});
}

function run(){
	var readStream = fs.createReadStream(args.file);
	var reader = readline.createInterface({input: readStream});
	var i = 0; 
	var lines = [];
	reader.on('line', function(line) {
		lines.push(line); 
		if(lines.length > 20) {
			writeLinesToPostFile(i, lines); 
			lines = [];
			i++; 
		}
	}); 
	reader.on('close', function() {
		writeLinesToPostFile(i, lines); 
	});
}

if(args.file) {
	run()
} else if(args.showHelp) {
	console.log(argParser.getManual()); 
} else {
	console.log("Please specify at least the file with the -f parameter"); 
	console.log(argParser.getManual()); 
}
