// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(JSON.stringify(Infinity));
results.push(JSON.stringify([
    [], {}, '"\\'
]));
results.push(JSON.stringify({ a: 1, b: 2, c: 3, '1': 4, '2': 5, 'null': 6 },
    ['a', 1, new String('b'), , undefined, '1', new Number(1), null, {}]
));
var replacer = new Array(1);
replacer.__proto__ = ['a'];
results.push(JSON.stringify({ a: 1 }, replacer));

results.push(JSON.stringify({}, null, 4));
results.push(JSON.stringify([], null, 4));
results.push(JSON.stringify({a:undefined}, null, 4));
try {
    var a = [];
    a[0] = a;
    JSON.stringify(a);
} catch (err) {
    results.push(err instanceof TypeError);
}

throw [results, [
    'null',
    '[[],{},"\\"\\\\"]',
    '{"a":1,"1":4,"b":2}',
    '{"a":1}',
   '{}',
   '[]',
   '{}',
    true,
], "DONE"];
