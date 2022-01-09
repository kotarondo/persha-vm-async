// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

results.push(Number(12.25).toFixed(1));
results.push(Number(-12.25).toFixed(1));

results.push(Number(12.25).toExponential(1));
results.push(Number(-12.25).toExponential(20));
results.push(Number(NaN).toExponential());
results.push(Number(Infinity).toExponential());
results.push(Number(-Infinity).toExponential(4));

try {
    Number(0).toExponential(-1);
} catch (err) {
    results.push(err instanceof RangeError);
}

results.push(Number(12.25).toPrecision(1));
results.push(Number(-12.25).toPrecision(20));
results.push(Number(NaN).toPrecision(2));
results.push(Number(Infinity).toPrecision(3));
results.push(Number(-Infinity).toPrecision(4));

try {
    Number(0).toPrecision(-1);
} catch (err) {
    results.push(err instanceof RangeError);
}

throw [results, [
    '12.3',
    '-12.3',
    '1.2e+1',
    '-1.22500000000000000000e+1',
    'NaN',
    'Infinity',
    '-Infinity',
    true,
    '1e+1',
    '-12.250000000000000000',
    'NaN',
    'Infinity',
    '-Infinity',
    true,
], "DONE"];
