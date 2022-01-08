// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(JSON.parse('"\\""'));
results.push(JSON.parse('-1'));
results.push(JSON.stringify(JSON.parse('[-1e-1,1.5e+10,1e1]')));
results.push(JSON.parse('false'));
var a = JSON.stringify([0, 1, { a: 2, b: 3 }, { b: 4, d: 5 }]);
results.push(a === JSON.stringify(JSON.parse(a, function(name, value) { return value })));
results.push(JSON.stringify(JSON.parse(a, function(name, value) {
    if (name == 'a') return;
    if (name == 'b' && this.d == 5) return 'rb';
    if (value == 1) return;
    return value;
})));

try {
    JSON.parse('"\\z"');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('01');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('1e+A');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('nul');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('f');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('t');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

try {
    JSON.parse('{"a":');
} catch (err) {
    results.push(err instanceof SyntaxError);
}

throw [results, [
    '"',
    -1,
    '[-0.1,15000000000,10]',
    false,
    true,
    '[0,null,{"b":3},{"b":"rb","d":5}]',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
], "DONE"];
