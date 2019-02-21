module.exports = {
	count: function(text) {
		var result = {
			wordCounts: {},
			totalWordCount: 0
		};

    var replaceString = '(?!\\p{L}).';
		text = text.replace(RegExp(replaceString, 'ugm'), ' ');
	
		var words = text.split(/[ \n]+/);

		words.forEach(word => {
			word = word.toLowerCase();
			if(word != '') {
				result.totalWordCount++;
				if(word in result.wordCounts)
					result.wordCounts[word]++;
				else
					result.wordCounts[word] = 1; 
				if(word == "unbestimmten")
					console.log("found 'unbestimmten' count is " + result.wordCounts[word] + " now");
			}
		});
		return result; 
	}
};
