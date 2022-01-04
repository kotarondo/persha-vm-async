// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date(NaN);
results.push(d.toString());
results.push(d.toDateString());
results.push(d.toTimeString());
results.push(d.toLocaleString());
results.push(d.toLocaleDateString());
results.push(d.toLocaleTimeString());

try {
    d.toUTCString();
    results.push(true);
} catch (err) {
    results.push(err instanceof RangeError);
}

throw [results, [
    'Invalid Date',
    'Invalid Date',
    'Invalid Date',
    'Invalid Date',
    'Invalid Date',
    'Invalid Date',
    true
], "DONE"];
