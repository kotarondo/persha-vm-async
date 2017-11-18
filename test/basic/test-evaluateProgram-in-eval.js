// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var geval = eval;

var r = function(x) {
    return eval("geval('var x=1'); x")
}(0);

results.push(r);

throw [results, [0], "DONE"];