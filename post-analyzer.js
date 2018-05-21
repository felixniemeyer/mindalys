module.exports = {
	count: function(text) {
		var result = {
			wordCounts: {},
			totalWordCount: 0
		};

		var charCodes = [36, 60, 62, 10,40,41,46,44,58,59,33,63,39,8212,8217, 8220, 8221]; 
		var replaceString = "[\-" + charCodes.map(code => {
			return String.fromCodePoint(code);
		}).join('') + "]";

		text = text.replace(RegExp(replaceString, 'g'), ' ');
	
		var words = text.split(/ +/);

		words.forEach(word => {
			word = word.toLowerCase();
			if(word != '') {
				result.totalWordCount++;
				if(word in result.wordCounts)
					result.wordCounts[word]++;
				else
					result.wordCounts[word] = 1; 
			}
		});
		return result; 
	}
};
