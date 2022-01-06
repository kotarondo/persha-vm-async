// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

try {
    new Function("++a++");
} catch (err) {
    results.push(err instanceof ReferenceError);
}

function fn1(a) { return a + 1; }
results.push(fn1.bind(null, 1).toString());

throw [results, [
    true,
    'function fn1(a){return a+1;}',
], "DONE"];
