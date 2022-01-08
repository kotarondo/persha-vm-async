// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

function fn1(a, b) { return 'x' + a + b; }
var x = { length: { valueOf: function() { return 1 } } };
x[0] = 10;
x[1] = 20;
results.push(fn1.apply(null, x));

try {
    new parseInt();
} catch (err) {
    results.push(err instanceof TypeError);
}

try {
    new(parseInt.bind(null))();
} catch (err) {
    results.push(err instanceof TypeError);
}

try {
    new(parseInt.bind(null).bind(null, 123))();
} catch (err) {
    results.push(err instanceof TypeError);
}

results.push(+new(String.bind(null, 123))());
results.push(+new(String.bind(null).bind(null, 123))());

throw [results, [
    'x10undefined',
    true,
    true,
    true,
    123,
    123,
], "DONE"];
