const fmt = require('../dedshroom/utils/format.js');

// format()
const env = { author: { id: "123", str: "Richard#1234(123)", points: 33.333 }, date: Date() };
const env2 = { gay: "no" };
const env3 = { gay: "yes" };

const msgA = "Message sent with normal quotes by ${author.id}";
const msgB = "Your very own special date formatted with \${date%utc}: ${date%utc}";
const msgC = "You have ${author.points%flr 4} points";
const msgD = "There are ${author.points%len} properties inside env";

const msgE = "Gay test sais ${gay}";

const expectedA = "Message sent with normal quotes by 123";
const expectedB = "Your very own special date formatted with ${date%utc}: " + new Date(env.date).toUTCString();
const expectedC = "You have 33.25 points";
const expectedD = "There are 3 properties inside env";


console.log(fmt.format(msgA, env));
console.log('PASSED: ' + (msgA.format(env) == expectedA) + '\n');
console.log(fmt.format(msgB, env));
console.log('PASSED: ' + (msgB.format(env) == expectedB) + '\n');
console.log(fmt.format(msgC, env));
console.log('PASSED: ' + (msgC.format(env) == expectedC) + '\n');
console.log(fmt.format(msgD, env));
console.log('PASSED: ' + (msgD.format(env) == expectedD) + '\n');
console.log(fmt.format(msgE, [env3, env2, env]));
console.log(fmt.format(msgE, [env2, env]));

// argSplit()
console.log('\n');
const compare = function (o1, o2) {
	return JSON.stringify(o1) === JSON.stringify(o2);
}

const args = {
	"theese are my args": ['theese', 'are', 'my', 'args'],
	"now \'with single quotes\'": ['now', 'with single quotes'],
	"now „with weird“ ‘quotes joey’ ‚likes to‘ “use sometimes”": ['now', 'with weird', 'quotes joey', 'likes to', 'use sometimes'],
	"now some 'malformed stuff": ['now', 'some', 'malformed stuff'],
	"now some “wrong weird„ quotes": ['now', 'some', 'wrong weird„ quotes']
}

for (var [str, expected] of Object.entries(args)) {
	var split = fmt.argSplit(str);
	console.log(split);
	console.log('PASSED: ' + compare(split, expected));
}
