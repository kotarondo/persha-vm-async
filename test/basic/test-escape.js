// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var a = '{\u1234\xff}';
var b = escape(a);
results.push(b);
results.push(unescape(b) === a);

throw [results, [
    '%7B%u1234%FF%7D',
    true,
], "DONE"];
