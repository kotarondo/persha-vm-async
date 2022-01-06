// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

function fn1(a, b) { return 'x' + a + b; }
var x = { length: { valueOf: function() { return 1 } } };
x[0] = 10;
x[1] = 20;
results.push(fn1.apply(null, x));
/*
try{
} catch (err) {
    results.push(err instanceof ReferenceError);
}
*/

throw [results, [
    'x10undefined',
], "DONE"];
