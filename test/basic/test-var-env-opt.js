// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

function y() {
    eval("var x=2");
}

void

function() {
    y();
    try {
        throw 3;
    } catch (x) {
        eval("var x=4");
    }
    results.push(x);
}();

throw [results, [undefined], "DONE"];
