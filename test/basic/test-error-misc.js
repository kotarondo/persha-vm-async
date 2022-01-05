// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(EvalError().toString());
results.push(EvalError('abc').toString());
results.push(new EvalError().toString());
results.push(new EvalError('abc').toString());

results.push(RangeError().toString());
results.push(RangeError('abc').toString());
results.push(new RangeError().toString());
results.push(new RangeError('abc').toString());

results.push(ReferenceError().toString());
results.push(ReferenceError('abc').toString());
results.push(new ReferenceError().toString());
results.push(new ReferenceError('abc').toString());

results.push(SyntaxError().toString());
results.push(SyntaxError('abc').toString());
results.push(new SyntaxError().toString());
results.push(new SyntaxError('abc').toString());

results.push(TypeError().toString());
results.push(TypeError('abc').toString());
results.push(new TypeError().toString());
results.push(new TypeError('abc').toString());

results.push(URIError().toString());
results.push(URIError('abc').toString());
results.push(new URIError().toString());
results.push(new URIError('abc').toString());

results.push(Error.prototype.stack);

try {
    var desc = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
    desc.get();
} catch (err) {
    results.push(err instanceof TypeError);
}

try {
    var desc = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
    desc.get.call({});
} catch (err) {
    results.push(err instanceof TypeError);
}

try {
    Error.prototype.toString.call();
} catch (err) {
    results.push(err instanceof TypeError);
}
results.push(Error.prototype.toString.call({}));


throw [results, [
    'EvalError',
    'EvalError: abc',
    'EvalError',
    'EvalError: abc',
    'RangeError',
    'RangeError: abc',
    'RangeError',
    'RangeError: abc',
    'ReferenceError',
    'ReferenceError: abc',
    'ReferenceError',
    'ReferenceError: abc',
    'SyntaxError',
    'SyntaxError: abc',
    'SyntaxError',
    'SyntaxError: abc',
    'TypeError',
    'TypeError: abc',
    'TypeError',
    'TypeError: abc',
    'URIError',
    'URIError: abc',
    'URIError',
    'URIError: abc',
    undefined,
    true,
    true,
    true,
    'Error',
], "DONE"];
