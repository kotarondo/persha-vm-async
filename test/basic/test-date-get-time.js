// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date('2020-12-31 23:23:23 GMT');

results.push(d.getTime());
results.push(d.getTimezoneOffset());
results.push(d.getFullYear());
results.push(d.getUTCFullYear());
results.push(d.getMonth());
results.push(d.getUTCMonth());
results.push(d.getDate());
results.push(d.getUTCDate());
results.push(d.getDay());
results.push(d.getUTCDay());
results.push(d.getHours());
results.push(d.getUTCHours());
results.push(d.getMinutes());
results.push(d.getUTCMinutes());
results.push(d.getSeconds());
results.push(d.getUTCSeconds());
results.push(d.getMilliseconds());
results.push(d.getUTCMilliseconds());
results.push(d.getYear());

d.setYear(NaN);
var nanc = 0;

if (isNaN(d.getTime())) nanc++;
if (isNaN(d.getTimezoneOffset())) nanc++;
if (isNaN(d.getFullYear())) nanc++;
if (isNaN(d.getUTCFullYear())) nanc++;
if (isNaN(d.getMonth())) nanc++;
if (isNaN(d.getUTCMonth())) nanc++;
if (isNaN(d.getDate())) nanc++;
if (isNaN(d.getUTCDate())) nanc++;
if (isNaN(d.getDay())) nanc++;
if (isNaN(d.getUTCDay())) nanc++;
if (isNaN(d.getHours())) nanc++;
if (isNaN(d.getUTCHours())) nanc++;
if (isNaN(d.getMinutes())) nanc++;
if (isNaN(d.getUTCMinutes())) nanc++;
if (isNaN(d.getSeconds())) nanc++;
if (isNaN(d.getUTCSeconds())) nanc++;
if (isNaN(d.getMilliseconds())) nanc++;
if (isNaN(d.getUTCMilliseconds())) nanc++;
if (isNaN(d.getYear())) nanc++;
results.push(nanc);

var fc = 0;
for (var i = -10000; i < 10000; i++) {
    d = new Date(i, 0, 1);
    d.setFullYear(i);
    if (i == d.getFullYear()) fc++;
    d = new Date(i, 11, 31, 23, 59, 59, 999);
    d.setFullYear(i);
    if (i == d.getFullYear()) fc++;
}
results.push(fc);

throw [results, [
    1609457003000,
    -540,
    2021,
    2020,
    0,
    11,
    1,
    31,
    5,
    4,
    8,
    23,
    23,
    23,
    23,
    23,
    0,
    0,
    121,
    19,
    40000
], "DONE"];
