/**
 * Searches an Array by matchFunc. (tests/commmon.js for examples)
 * @param {array} array
 * @param {function} matchFunc Takes a parameter and returns a number based on how well it matches.
 * @param {number} [threshhold=0] Minimum value to be counted as a match
 * @param {number} [maxResults=-1] Maximum results. Lower values mean better performance. 0 means no limit.
 * @returns {array.<object>} Array of results in descending order. `[{match: number, value: entry}]`
 * @example
```js
//Find the 4 closest entries to 16:
var lol = [0, 1, 9, 7, 3, 4, 5, 2, 8, 20];
util.weightedSearch(lol, (x) => { return -Math.abs(16 - x) }, -10, 4)
//[ { match: -4, value: 20 },
//{ match: -7, value: 9 },
//{ match: -8, value: 8 },
//{ match: -9, value: 7 } ]
//More examples in the tests.
```
 */
module.exports.weightedSearch = (array, matchFunc, threshhold = 0, maxResults = 0) => {
	var results = [];
	//resultGate represents lowest match in results.
	var resultGate = threshhold;

	for (let x of array) {
		var matchV = matchFunc(x);
		if (matchV >= threshhold) {
			if (results.length < maxResults||maxResults===0) {
				//Array is smaller than maxResults. Simply push to results.
				results.push({ match: matchV, value: x });
			} else if (matchV > resultGate) {
				//Array is full. But current entry matches better than one of the results entries.
				//Find lowest matching entry backwards and replace.
				let lowestIx = results.length - 1;
				let lowestV = results[lowestIx].match;
				let tempV;
				for (let i = lowestIx - 1; i >= 0; i--) {
					if ((tempV = results[i].match) < lowestV) {
						lowestV = tempV;
						lowestIx = i;
					}
				}
				//Replace entry.
				results[lowestIx] = { match: matchV, value: x };
			}
		}
	}

	//Sort results
	results.sort((a, b) => { return a.match < b.match; });
	return results;
}