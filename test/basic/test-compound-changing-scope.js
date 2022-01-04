// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var x = 'A';
void

function() {
    x += eval("var x; x = 'B'");
}();
results.push(x);

var x = 'A';
void

function() {
    eval("var x; x = 'B'");
    x += eval("delete x");
}();
results.push(x);

throw [results, ['AB', 'A'], "DONE"];
