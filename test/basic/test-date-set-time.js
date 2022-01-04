// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date('2020-2-28 11:23:45 GMT');

var t = d.valueOf();
results.push(t);

d.setTime(t+((12*60+12)*60+13)*1000+456);
results.push(d.toISOString());

d.setMilliseconds(99999);
results.push(d.toISOString());

d.setUTCMilliseconds(99123);
results.push(d.toISOString());

d.setSeconds(9999);
results.push(d.toISOString());

d.setSeconds(5678, 9876);
results.push(d.toISOString());

d.setUTCSeconds(9999);
results.push(d.toISOString());

d.setUTCSeconds(5678, 9876);
results.push(d.toISOString());

throw [results, [
   1582889025000,
   '2020-02-28T23:35:58.456Z',
   '2020-02-28T23:37:37.999Z',
   '2020-02-28T23:39:16.123Z',
   '2020-02-29T02:25:39.123Z',
   '2020-02-29T03:59:47.876Z',
   '2020-02-29T06:45:39.876Z',
   '2020-02-29T08:19:47.876Z'

], "DONE"];
