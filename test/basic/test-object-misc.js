// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(({}).isPrototypeOf(1));

var desc = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__');
results.push(typeof desc.set === 'function');

var x = {};
x.__proto__ = 1;
results.push(x.__proto__ === Object.prototype);

x.__proto__ = Object.prototype;
results.push(x.__proto__ === Object.prototype);

results.push(desc.set.call(1) === undefined);

try {
    x.__proto__ = x;
} catch (err) {
    results.push(err instanceof TypeError);
}

Object.freeze(x);
x.__proto__ = Object.prototype;
results.push(x.__proto__ === Object.prototype);


throw [results, [
    false,
    true,
    true,
    true,
    true,
    true,
    true,
], "DONE"];
