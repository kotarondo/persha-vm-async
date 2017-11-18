// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var Math;
function test(){
    results.push(Math);
}

delete Math;
Object.prototype.Math = 123;
test();

throw [results, [123], "DONE"];
