// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

try {
    eval("var var");
} catch (err) {
    results.push(err.stack.split('\n')[1]);
}
results.push(new Error().stack.split('\n')[1]);

//#line 100  "testfile.js"
results.push(new Error().stack.split('\n')[1]);

//#line 200  "testfile  .js"
try {
    eval("var var");
} catch (err) {
    results.push(err.stack.split('\n')[1]);
}

//#line 20 this is not a file name
try {
    eval("var var");
} catch (err) {
    results.push(err.stack.split('\n')[1]);
}

/* */ //#line 1000 this is not a line directive
results.push(new Error().stack.split('\n')[1]);

try {
    eval('//#line 100 "eval-test"\nvar var');
} catch (err) {
    results.push(err.stack.split('\n')[0]);
}

throw [results, [
    "    at test-line-directive.js:8:5",
    "    at test-line-directive.js:12:1",
    "    at testfile.js:100:1",
    "    at testfile  .js:201:5",
    "    at testfile  .js:21:5",
    "    at testfile  .js:27:1",
    "SyntaxError: eval-test:100:5",
], "DONE"];
