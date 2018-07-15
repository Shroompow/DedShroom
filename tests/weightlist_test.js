var WeightList = require("../dedshroom/utils/weightlist.js");

var l, aCount, bCount, cCount;

var startNewTest = () => {
	l = new WeightList();
	aCount = 0;
	bCount = 0;
	cCount = 0;
};

var logTest = (name) => {
	console.log("Results for:", name);
	var avDiff = (Math.abs(aCount - bCount) + Math.abs(bCount - cCount) + Math.abs(cCount - aCount)) / 3.0;

	console.log("Absolutes:");
	console.log("A:", aCount, "B:", bCount, "C:", cCount);
	console.log("AverageDifference:", avDiff);

	console.log("Relatives:");
	console.log("A:", (aCount / tests * 100) + "%", "B:", (bCount / tests * 100) + "%", "C:", (cCount / tests * 100) + "%");
	console.log("AverageDifference:", (avDiff / tests * 100) + "%");
	console.log("=========");
};

/**
 * A
 */

startNewTest();

l.push(() => { aCount++ }, 1);
l.push(() => { bCount++ }, 1);
l.push(() => { cCount++ }, 1);

var tests = 10000;
for (var i = 0; i < tests; i++) {
	var f = l.getWeighted(Math.random());
	f();
}

logTest("A");


/**
 * B
 */

startNewTest();

l.push(() => { aCount++ }, 1);
l.push(() => { bCount++ }, 1);
l.push(() => { cCount++ }, 2);

var tests = 10000;
for (var i = 0; i < tests; i++) {
	var f = l.getWeighted(Math.random());
	f();
}

logTest("B");


/**
 * C
 */

startNewTest();

l.push(() => { aCount++ }, 3);
l.push(() => { bCount++ }, 1);
l.push(() => { cCount++ }, 0.5);

var tests = 10000;
for (var i = 0; i < tests; i++) {
	var f = l.getWeighted(Math.random());
	f();
}

logTest("C");