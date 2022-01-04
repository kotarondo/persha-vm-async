// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date();
results.push(d.toString() == d.toDateString() + ' ' + d.toTimeString() + ' JST');
results.push(d.toLocaleString() == d.toString());
results.push(d.toLocaleDateString() == d.toDateString());
results.push(d.toLocaleTimeString() == d.toTimeString());

throw [results, [true, true, true, true], "DONE"];
