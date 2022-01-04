// Copyright (c) 2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

var results = [];

var d = new Date('2020-2-28 11:23:45 GMT');

var t = d.valueOf();
results.push(t);

d.setTime(t + ((12 * 60 + 12) * 60 + 13) * 1000 + 456);
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

d.setMinutes(7777);
results.push(d.toISOString());

d.setMinutes(66, 55);
results.push(d.toISOString());

d.setMinutes(66, 55, 44);
results.push(d.toISOString());

d.setUTCMinutes(7777);
results.push(d.toISOString());

d.setUTCMinutes(66, 55);
results.push(d.toISOString());

d.setUTCMinutes(66, 55, 44);
results.push(d.toISOString());

d.setHours(7777);
results.push(d.toISOString());

d.setHours(66, 55);
results.push(d.toISOString());

d.setHours(66, 55, 44);
results.push(d.toISOString());

d.setHours(66, 55, 44, 333);
results.push(d.toISOString());

d.setUTCHours(7777);
results.push(d.toISOString());

d.setUTCHours(66, 55);
results.push(d.toISOString());

d.setUTCHours(66, 55, 44);
results.push(d.toISOString());

d.setUTCHours(66, 55, 44, 333);
results.push(d.toISOString());

d.setDate(321);
results.push(d.toISOString());

d.setUTCDate(321);
results.push(d.toISOString());

d.setMonth(321);
results.push(d.toISOString());

d.setMonth(321, 654);
results.push(d.toISOString());

d.setUTCMonth(321);
results.push(d.toISOString());

d.setUTCMonth(321, 654);
results.push(d.toISOString());

d.setFullYear(2345);
results.push(d.toISOString());

d.setFullYear(2345, 67);
results.push(d.toISOString());

d.setFullYear(2345, 67, 89);
results.push(d.toISOString());

d.setUTCFullYear(2345);
results.push(d.toISOString());

d.setUTCFullYear(2345, 67);
results.push(d.toISOString());

d.setUTCFullYear(2345, 67, 89);
results.push(d.toISOString());

d.setYear(67);
results.push(d.toISOString());

d.setYear(1967);
results.push(d.toISOString());

d.setYear(NaN);
d.setYear(2000);
results.push(d.toISOString());
d.setFullYear(NaN);
d.setFullYear(2000);
results.push(d.toISOString());
d.setUTCFullYear(NaN);
d.setUTCFullYear(2000);
results.push(d.toISOString());

results.push(new Date(2022, 8, 1).toISOString());
results.push(new Date(2022, 11, 1).toISOString());
results.push(Date.UTC(1e100, 0, 1));

try {
    Date.prototype.setTime.call(new String('abc'));
} catch (err) {
    results.push(err instanceof TypeError);
}

throw [results, [
    1582889025000,
    '2020-02-28T23:35:58.456Z',
    '2020-02-28T23:37:37.999Z',
    '2020-02-28T23:39:16.123Z',
    '2020-02-29T02:25:39.123Z',
    '2020-02-29T03:59:47.876Z',
    '2020-02-29T06:45:39.876Z',
    '2020-02-29T08:19:47.876Z',
    '2020-03-05T17:37:47.876Z',
    '2020-03-05T18:06:55.876Z',
    '2020-03-05T19:06:55.044Z',
    '2020-03-11T04:37:55.044Z',
    '2020-03-11T05:06:55.044Z',
    '2020-03-11T06:06:55.044Z',
    '2021-01-28T16:06:55.044Z',
    '2021-01-31T09:55:55.044Z',
    '2021-02-02T09:55:44.044Z',
    '2021-02-04T09:55:44.333Z',
    '2021-12-25T01:55:44.333Z',
    '2021-12-27T18:55:44.333Z',
    '2021-12-29T18:55:44.333Z',
    '2021-12-31T18:55:44.333Z',
    '2022-11-16T18:55:44.333Z',
    '2023-09-17T18:55:44.333Z',
    '2049-10-17T18:55:44.333Z',
    '2077-07-14T18:55:44.333Z',
    '2103-10-14T18:55:44.333Z',
    '2131-07-16T18:55:44.333Z',
    '2345-07-16T18:55:44.333Z',
    '2350-08-16T18:55:44.333Z',
    '2350-10-27T18:55:44.333Z',
    '2345-10-27T18:55:44.333Z',
    '2350-08-27T18:55:44.333Z',
    '2350-10-28T18:55:44.333Z',
    '1967-10-28T18:55:44.333Z',
    '1967-10-28T18:55:44.333Z',
    '1999-12-31T15:00:00.000Z',
    '1999-12-31T15:00:00.000Z',
    '2000-01-01T00:00:00.000Z',
    '2022-08-31T15:00:00.000Z',
    '2022-11-30T15:00:00.000Z',
    NaN,
    true,
], "DONE"];
