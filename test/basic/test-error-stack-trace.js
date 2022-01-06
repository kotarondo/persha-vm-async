// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

(function fn1() {
    var e = new Error('xyz');
    results.push(e.stack);
})();


throw [results, [
    'Error: xyz\n' +
    '    at fn1 (test-error-stack-trace.js:8:11)\n' +
    '    at test-error-stack-trace.js:7:1'
], "DONE"];
