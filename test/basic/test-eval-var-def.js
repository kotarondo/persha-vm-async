// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var x1 = "a";
var x2 = "b";
var x3 = "c";
var x4 = "d";

void

function() {
    var x1 = 1;
    eval("var x2=2;");
    var x3 = 3;
    eval("var x4=4;");

    results.push(delete x1);
    results.push(x1);
    results.push(delete x2);
    results.push(x2);
    results.push(eval("delete x3"));
    results.push(x3);
    results.push(eval("delete x4"));
    results.push(x4);
}();

results.push(x1);
results.push(x2);
results.push(x3);
results.push(x4);

throw [results, [false, 1, true, 'b', false, 3, true, 'd', 'a', 'b', 'c', 'd'], "DONE"];
