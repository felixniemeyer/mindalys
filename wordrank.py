#!/usr/bin/env python3
import sys
import io
import re

referenceFileName = ""
state = "scanning"
for arg in sys.argv[1:]:
	if state == "scanning":
		if arg == "--reference" or arg == "-r":
			state = "set-reference"
	elif state == "set-reference":
		referenceFileName = arg
		state = "scanning"

def countWords(stream):
	totalWords = 0
	wordCounts = {}
	for line in stream: 
		stripped = re.sub(r'\&|\*|_|-|/|\(|\)|\.|,|\?|!|;|:|\"|“|”|…|\n|\r|\t|•|◦|' + '\uFEFF', ' ', line).strip()
		if stripped != '':
			words = re.split(' +', stripped);
			for word in words: 
				word = word.lower();
				if word in wordCounts:
					wordCounts[word] += 1
				else:
					wordCounts[word] = 1
				totalWords += 1
	return totalWords, wordCounts

totalCount, counts = countWords(sys.stdin)
referenceFile = open(referenceFileName, 'r')
referenceTotalCount, referenceCounts = countWords(referenceFile) 


def normalizedRatio(word):
	if word in referenceCounts:
		return (counts[word]/totalCount) / (referenceCounts[word]/referenceTotalCount)
	else:
		if counts[word] > 10:
			return 1000 + counts[word]
		else:
			return 0

i = 1
zeile = 0
for word in sorted(counts, key=normalizedRatio, reverse=True):
	count = counts[word]
	if count > 0:
		if zeile % 30 == 0: 
			print("\nRank\tcount\tfreq\trCount\trFreq\tfR\tword")
		zeile += 1
		print('{0}.\t{1}\t{3:.2%}\t{5}\t{6:.2%}\t{4:.2%}\t{2}'.format(i, count, word, count/totalCount, normalizedRatio(word), referenceCounts[word], referenceCounts[word]/referenceTotalCount))
	i += 1


print("Total totalCount: " + str(totalCount)) 
	
	
