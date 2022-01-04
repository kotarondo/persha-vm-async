// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date();
results.push(d.toString() == d.toDateString() + ' ' + d.toTimeString() + ' JST');
results.push(d.toLocaleString() == d.toString());
results.push(d.toLocaleDateString() == d.toDateString());
results.push(d.toLocaleTimeString() == d.toTimeString());

var x = d.toUTCString();
var y = d.toISOString();
var m = /^([0-9-]*)T([0-9:]*)\.[0-9]*Z$/.exec(y);
results.push(x == m[1] + ' ' + m[2] + ' UTC');

throw [results, [true, true, true, true, true], "DONE"];
