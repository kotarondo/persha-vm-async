// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var r = eval("var x=0; \
L1:{'A'; \
    while(true){ \
        if(++x === 1) 'B'; \
        else break L1; \
    } \
}");

results.push(r);

throw [results, ['A'], "DONE"];
