// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(Array.prototype.toString.call(new String('abc')));
results.push([].toLocaleString());
results.push([, , 1].slice(0));
results.push([21, 12, 5, 21].sort());
var a = [1, 2, , 6];
results.push(a.splice(1), a);
var a = [1, , , 6];
results.push(a.splice(0, 1), a);
var a = [7, 6, , , 8];
results.push(a.splice(1, 2, 3, 4, 5), a);

try {
    [Object.create(null)].toLocaleString();
} catch (err) {
    results.push(err instanceof TypeError);
}
try {
    [0, Object.create(null)].toLocaleString();
} catch (err) {
    results.push(err instanceof TypeError);
}

try {
    [3, 2, 1].sort(Object.create(null));
} catch (err) {
    results.push(err instanceof TypeError);
}

var a = ['a', 'b', 'c'];
Object.defineProperty(a, 'length', { writable: false });
a[100] = 'd';
results.push(a.length);

(function() {
    'use strict';
    try {
        a.length = 100;
    } catch (err) {
        results.push(err instanceof TypeError);
    }
    try {
        a[100] = 'd';
    } catch (err) {
        results.push(err instanceof TypeError);
    }
})();

var a = [5];
a[3] = 7;
a.length = 100;
Object.defineProperty(a, '3', { configurable: false });
a.length = 1;
results.push(a);

var a = [5, 6, 7, 8];
Object.defineProperty(a, '2', { configurable: false });
a.length = 1;
results.push(a);

throw [results, [
    '[object String]',
    '',
    [, , 1],
    [12, 21, 21, 5],
    [2, , 6],
    [1],
    [1],
    [, , 6],
    [6, , ],
    [7, 3, 4, 5, , 8],
    true,
    true,
    true,
    3,
    true,
    true,
    [5, , , 7],
    [5, 6, 7],

], "DONE"];
