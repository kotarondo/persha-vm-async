// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

try {
    eval("'use strict'; for(arguments in [ 1, 2 ]);");
    results.push("NG");
} catch (e) {
    results.push("OK");
}

throw [results, ['OK'], "DONE"];