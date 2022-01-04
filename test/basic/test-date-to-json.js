// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date();
results.push(d.toJSON() == d.toISOString());
results.push(new Date(NaN).toJSON());
try {
    Date.prototype.toJSON.call(new String('abc'));
} catch (err) {
    results.push(err instanceof TypeError);
}
throw [results, [true, null, true, ], "DONE"];
