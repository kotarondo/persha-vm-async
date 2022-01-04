// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(Date.UTC(1981, 1));
results.push(Date.UTC(1982, 2, 3));
results.push(Date.UTC(1983, 3, 4, 5));
results.push(Date.UTC(1984, 4, 5, 6, 7));
results.push(Date.UTC(1985, 5, 16, 7, 8, 9));
results.push(Date.UTC(1986, 6, 17, 8, 9, 10, 11));

throw [results, [
    349833600000,
    383961600000,
    418280400000,
    452585220000,
    487753689000,
    521971750011

], "DONE"];
