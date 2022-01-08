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

var fn2 = function(a) {
    return a + 1;
}
results.push(fn2.toString());

var fn3 = new Function("a,  b,\tc\n, d\n", " /*xxx*/ return a+b /***/ ; ");
fn3.name = 'bbbb';
results.push(fn3.toString());
results.push(fn3.bind(null, 1).bind(null, 2).toString());

var desc = Object.getOwnPropertyDescriptor(Function.prototype, 'name');
try {
    desc.get();
} catch (err) {
    results.push(err instanceof TypeError);
}

results.push(desc.get.call(Math.sin));

fn1.__proto__ = { caller: fn1 };
results.push(fn1.caller === fn1);

fn1.__proto__ = { caller: function() { 'use strict' } };
try {
    fn1.caller;
} catch (err) {
    results.push(err instanceof TypeError);
}

throw [results, [
    true,
    'function fn1(a){ return a + 1; }',
    'function anonymous(a){\n    return a + 1;\n}',
    'function anonymous(a,b,c,d){ /*xxx*/ return a+b /***/ ; }',
    'function anonymous(a,b,c,d){ /*xxx*/ return a+b /***/ ; }',
    true,
    '',
    true,
    true,
], "DONE"];
