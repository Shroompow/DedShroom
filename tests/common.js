const util = require("../dedshroom/utils/common.js");

//Weighted Search Test 1. Find the 4 closest entries to 16
var lol = [0, 1, 9, 7, 3, 4, 5, 2, 8, 20];
console.log("Test1\n",
	util.weightedSearch(lol, (x) => { return -Math.abs(16 - x) }, -10, 4)
);

//Weighted Search Test 2. Find the 4 top players considering foo and bar, but foo is half as important as bar.
var rofl = [
	{ foo: 0, 	bar: 36	,name:"Jerry"},
	{ foo: 34, 	bar: 5	,name:"Oh hai mark"},
	{ foo: 35, 	bar: 35	,name:"MLG"},
	{ foo: 56, 	bar: 28	,name:"Isaac"},
	{ foo: 36, 	bar: 2	,name:"DedShroom"},
	{ foo: 1, 	bar: 14	,name:"dedChar"},
	{ foo: 8, 	bar: 27	,name:"ShroomPow"},
	{ foo: 85, 	bar: 48	,name:"Funny Bone"},
	{ foo: 34, 	bar: 25	,name:"Bone Zone123"},
	{ foo: 26, 	bar: 26	,name:"B"},
	{ foo: 26, 	bar: 16	,name:"E"}
];

console.log("Test2\n",
	util.weightedSearch(rofl, (x) => { return x.foo*0.5 + x.bar }, 0, 4)
);

//Weighted Search Test 3. Find the 3 players using the rules of Test2, but bar shall not be greater than foo.
console.log("Test3\n",
	util.weightedSearch(rofl, (x) => { return x.bar > x.foo ? -1 : x.foo*0.5 + x.bar }, 0, 3)
);

//Weighted Search Test 4. Find the players whoose foo and bar values are the same.
console.log("Test4\n",
	util.weightedSearch(rofl, (x) => { return x.foo == x.bar ? 1 : -1 })
);