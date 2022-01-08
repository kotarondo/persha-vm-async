// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var a = '\u1234\uD800\uDC00\uDBFF\uDFFF';
var b = encodeURI(a);
results.push(b);
results.push(decodeURI(b) === a);

try {
    encodeURI('\uD800\uD801');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%1Z');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%C0%1Z');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%C0%80');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%E0%80%80');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%F0%80%80%80');
} catch (err) {
    results.push(err instanceof URIError);
}

try {
    decodeURI('%ED%BF%BF');
} catch (err) {
    results.push(err instanceof URIError);
}

throw [results, [
    '%E1%88%B4%F0%90%80%80%F4%8F%BF%BF',
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
], "DONE"];
