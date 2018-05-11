module.exports = {
	count: function(text) {
		var result = {
			wordCounts: {},
			totalWordCount: 0
		};
		text = text.replace(/\&|\*|_|- | -|/|\(|\)|\.|,|\?|!|;|:|\"|“|”|…|\n|\r|\t|•|◦|\uFEFF/, ' ');
		text = text.replace(/-/, '');
		var words = text.split(/ +/);
		console.log(`Words: ${words}`);
		words.forEach(word => {
			result.totalWordCount++;
			if(word in result.wordCounts)
				result.wordCounts[word]++;
			else
				result.wordCounts[word] = 1; 
		}
		return result; 
	}
};
