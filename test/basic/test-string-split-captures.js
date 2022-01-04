// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push("abc".split(/b/));
results.push("abc".split(/(b)/));
results.push("abc".split(/b|(b)/));
results.push("abc".split(/x|(b)|(x)/));

throw [results, [
    ['a', 'c'],
    ['a', 'b', 'c'],
    ['a', undefined, 'c'],
    ['a', 'b', undefined, 'c'],
], "DONE"];
