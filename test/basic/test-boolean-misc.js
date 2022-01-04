// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(Boolean.prototype.valueOf.call(true));
results.push(Boolean.prototype.valueOf.call(false));

throw [results, [true, false], "DONE"];
