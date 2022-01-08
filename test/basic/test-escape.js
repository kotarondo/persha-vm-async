// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var a = 'abc{\u1234\xff}';
var b = escape(a);
results.push(b);
results.push(unescape(b) === a);
results.push(unescape('%%1%41%4'));

throw [results, [
    'abc%7B%u1234%FF%7D',
    true,
    '%%1A%4'
], "DONE"];
