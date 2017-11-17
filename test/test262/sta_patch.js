// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var original = getPrecision;
getPrecision = function(a) {
    return 1.5 * original(a);
};

delete Test262Error.prototype.toString;
Test262Error.prototype.name = "Test262 Error";
