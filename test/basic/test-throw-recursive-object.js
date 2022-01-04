// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var r = {
    d: 'D'
};

r.r = r;
r.a = [, r, 1000000];
r.a[1000000] = r.a;

results.push(r);

throw [results, results, "DONE"];
