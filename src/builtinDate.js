/*
 Copyright (c) 2015-2017, Kotaro Endo.
 All rights reserved.
 
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:
 
 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 
 2. Redistributions in binary form must reproduce the above
    copyright notice, this list of conditions and the following
    disclaimer in the documentation and/or other materials provided
    with the distribution.
 
 3. Neither the name of the copyright holder nor the names of its
    contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// ECMAScript 5.1: 15.9 Date Objects

var LocalTZA = 0;
var LocalTZAString = "GMT";

function modulo(x, y) {
    return x - y * Math.floor(x / y);
}

function Day(t) {
    return Math.floor(t / msPerDay);
}

const msPerDay = 86400000;

function TimeWithinDay(t) {
    return modulo(t, msPerDay);
}

function DaysInYear(y) {
    if (modulo(y, 4) !== 0) return 365;
    if (modulo(y, 100) !== 0) return 366;
    if (modulo(y, 400) !== 0) return 365;
    return 366;
}

function DayFromYear(y) {
    return 365 * (y - 1970) + Math.floor((y - 1969) / 4) - Math.floor((y - 1901) / 100) + Math.floor((y - 1601) / 400);
}

function TimeFromYear(y) {
    return msPerDay * DayFromYear(y);
}

function YearFromTime(t) {
    var y = Math.floor(Day(t) / 365.2425);
    if (TimeFromYear(y) <= t) {
        while (TimeFromYear(y + 1) <= t) {
            y = y + 1;
        }
        return y;
    }
    y = y - 1;
    while (TimeFromYear(y) > t) {
        y = y - 1;
    }
    return y;
}

function InLeapYear(t) {
    if (DaysInYear(YearFromTime(t)) === 365) return 0;
    return 1;
}

function MonthFromTime(t) {
    var dayWithinYear = DayWithinYear(t);
    var inLeapYear = InLeapYear(t);
    if (dayWithinYear < 31) return 0;
    if (dayWithinYear < 59 + inLeapYear) return 1;
    if (dayWithinYear < 90 + inLeapYear) return 2;
    if (dayWithinYear < 120 + inLeapYear) return 3;
    if (dayWithinYear < 151 + inLeapYear) return 4;
    if (dayWithinYear < 181 + inLeapYear) return 5;
    if (dayWithinYear < 212 + inLeapYear) return 6;
    if (dayWithinYear < 243 + inLeapYear) return 7;
    if (dayWithinYear < 273 + inLeapYear) return 8;
    if (dayWithinYear < 304 + inLeapYear) return 9;
    if (dayWithinYear < 334 + inLeapYear) return 10;
    if (dayWithinYear < 365 + inLeapYear) return 11;
}

function DayWithinYear(t) {
    return Day(t) - DayFromYear(YearFromTime(t));
}

function DateFromTime(t) {
    var monthFromTime = MonthFromTime(t);
    if (monthFromTime === 0) return DayWithinYear(t) + 1;
    if (monthFromTime === 1) return DayWithinYear(t) - 30;
    if (monthFromTime === 2) return DayWithinYear(t) - 58 - InLeapYear(t);
    if (monthFromTime === 3) return DayWithinYear(t) - 89 - InLeapYear(t);
    if (monthFromTime === 4) return DayWithinYear(t) - 119 - InLeapYear(t);
    if (monthFromTime === 5) return DayWithinYear(t) - 150 - InLeapYear(t);
    if (monthFromTime === 6) return DayWithinYear(t) - 180 - InLeapYear(t);
    if (monthFromTime === 7) return DayWithinYear(t) - 211 - InLeapYear(t);
    if (monthFromTime === 8) return DayWithinYear(t) - 242 - InLeapYear(t);
    if (monthFromTime === 9) return DayWithinYear(t) - 272 - InLeapYear(t);
    if (monthFromTime === 10) return DayWithinYear(t) - 303 - InLeapYear(t);
    if (monthFromTime === 11) return DayWithinYear(t) - 333 - InLeapYear(t);
}

function WeekDay(t) {
    return modulo((Day(t) + 4), 7);
}

function DaylightSavingTA(t) {
    return 0;
}

function LocalTime(t) {
    return t + LocalTZA + DaylightSavingTA(t);
}

function UTCTime(t) {
    return t - LocalTZA - DaylightSavingTA(t - LocalTZA);
}

function HourFromTime(t) {
    return modulo(Math.floor(t / msPerHour), HoursPerDay);
}

function MinFromTime(t) {
    return modulo(Math.floor(t / msPerMinute), MinutesPerHour);
}

function SecFromTime(t) {
    return modulo(Math.floor(t / msPerSecond), SecondsPerMinute);
}

function msFromTime(t) {
    return modulo(t, msPerSecond);
}

const HoursPerDay = 24;
const MinutesPerHour = 60;
const SecondsPerMinute = 60;
const msPerSecond = 1000;
const msPerMinute = 60000;
const msPerHour = 3600000;

function MakeTime(hour, min, sec, ms) {
    if (!(isFinite(hour) && isFinite(min) && isFinite(sec) && isFinite(ms))) return NaN;
    var h = _ToInteger(hour);
    var m = _ToInteger(min);
    var s = _ToInteger(sec);
    var milli = _ToInteger(ms);
    var t = h * msPerHour + m * msPerMinute + s * msPerSecond + milli;
    return t;
}

function MakeDay(year, month, date) {
    if (!(isFinite(year) && isFinite(month) && isFinite(date))) return NaN;
    var y = _ToInteger(year);
    var m = _ToInteger(month);
    var dt = _ToInteger(date);
    var ym = y + Math.floor(m / 12);
    var mn = modulo(m, 12);
    var t = TimeFromYear(ym);
    if (mn === 1) {
        t += msPerHour * HoursPerDay * 31;
    }
    if (mn === 2) {
        t += msPerHour * HoursPerDay * (59 + InLeapYear(t));
    }
    if (mn === 3) {
        t += msPerHour * HoursPerDay * (90 + InLeapYear(t));
    }
    if (mn === 4) {
        t += msPerHour * HoursPerDay * (120 + InLeapYear(t));
    }
    if (mn === 5) {
        t += msPerHour * HoursPerDay * (151 + InLeapYear(t));
    }
    if (mn === 6) {
        t += msPerHour * HoursPerDay * (181 + InLeapYear(t));
    }
    if (mn === 7) {
        t += msPerHour * HoursPerDay * (212 + InLeapYear(t));
    }
    if (mn === 8) {
        t += msPerHour * HoursPerDay * (243 + InLeapYear(t));
    }
    if (mn === 9) {
        t += msPerHour * HoursPerDay * (273 + InLeapYear(t));
    }
    if (mn === 10) {
        t += msPerHour * HoursPerDay * (304 + InLeapYear(t));
    }
    if (mn === 11) {
        t += msPerHour * HoursPerDay * (334 + InLeapYear(t));
    }
    if (!(YearFromTime(t) === ym && MonthFromTime(t) === mn && DateFromTime(t) === 1)) return NaN;
    return Day(t) + dt - 1;
}

function MakeDate(day, time) {
    if (!(isFinite(day) && isFinite(time))) return NaN;
    return day * msPerDay + time;
}

function TimeClip(time) {
    if (!isFinite(time)) return NaN;
    if (Math.abs(time) > 8.64e15) return NaN;
    return _ToInteger(time);
}

function toISODateString(t) {
    var y = YearFromTime(t);
    var m = MonthFromTime(t) + 1;
    var d = DateFromTime(t);
    if (0 <= y && y <= 9999) {
        var ys = formatNumber(y, 4);
    } else if (y < 0) {
        var ys = "-" + formatNumber(-y, 6);
    } else {
        var ys = "+" + formatNumber(y, 6);
    }
    return ys + "-" + formatNumber(m, 2) + "-" + formatNumber(d, 2);
}

function toISOTimeString(t) {
    var h = HourFromTime(t);
    var m = MinFromTime(t);
    var s = SecFromTime(t);
    return formatNumber(h, 2) + ":" + formatNumber(m, 2) + ":" + formatNumber(s, 2);
}

async function Date_Call(thisValue, argumentsList) {
    return await Date_prototype_toString(await Date_Construct([]), []);
}

async function Date_Construct(argumentsList) {
    if (argumentsList.length >= 2) {
        var year = argumentsList[0];
        var month = argumentsList[1];
        var date = argumentsList[2];
        var hours = argumentsList[3];
        var minutes = argumentsList[4];
        var seconds = argumentsList[5];
        var ms = argumentsList[6];
        var obj = VMObject(Class_Date);
        obj.Prototype = realm.Date_prototype;
        obj.Extensible = true;
        var y = await ToNumber(year);
        var m = await ToNumber(month);
        if (argumentsList.length >= 3) {
            var dt = await ToNumber(date);
        } else {
            var dt = 1;
        }
        if (argumentsList.length >= 4) {
            var h = await ToNumber(hours);
        } else {
            var h = 0;
        }
        if (argumentsList.length >= 5) {
            var min = await ToNumber(minutes);
        } else {
            var min = 0;
        }
        if (argumentsList.length >= 6) {
            var s = await ToNumber(seconds);
        } else {
            var s = 0;
        }
        if (argumentsList.length >= 7) {
            var milli = await ToNumber(ms);
        } else {
            var milli = 0;
        }
        if (isNaN(y) === false && (0 <= _ToInteger(y)) && (_ToInteger(y) <= 99)) {
            var yr = 1900 + _ToInteger(y);
        } else {
            var yr = y;
        }
        var finalDate = MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli));
        obj.PrimitiveValue = TimeClip(UTCTime(finalDate));
        return obj;
    }
    if (argumentsList.length === 1) {
        var value = argumentsList[0];
        var obj = VMObject(Class_Date);
        obj.Prototype = realm.Date_prototype;
        obj.Extensible = true;
        var v = await ToPrimitive(value);
        if (Type(v) === TYPE_String) {
            var V = await Date_parse(undefined, [v]);
        } else {
            var V = await ToNumber(v);
        }
        obj.PrimitiveValue = TimeClip(V);
        return obj;
    }
    var obj = VMObject(Class_Date);
    obj.Prototype = realm.Date_prototype;
    obj.Extensible = true;
    obj.PrimitiveValue = await Date_now();
    return obj;
}

async function Date_parse(thisValue, argumentsList) {
    var string = argumentsList[0];
    var s = await ToString(string);
    return nonDeterministicValue(Date.parse(s));
}

async function Date_UTC(thisValue, argumentsList) {
    var year = argumentsList[0];
    var month = argumentsList[1];
    var date = argumentsList[2];
    var hours = argumentsList[3];
    var minutes = argumentsList[4];
    var seconds = argumentsList[5];
    var ms = argumentsList[6];
    var y = await ToNumber(year);
    var m = await ToNumber(month);
    if (argumentsList.length >= 3) {
        var dt = await ToNumber(date);
    } else {
        var dt = 1;
    }
    if (argumentsList.length >= 4) {
        var h = await ToNumber(hours);
    } else {
        var h = 0;
    }
    if (argumentsList.length >= 5) {
        var min = await ToNumber(minutes);
    } else {
        var min = 0;
    }
    if (argumentsList.length >= 6) {
        var s = await ToNumber(seconds);
    } else {
        var s = 0;
    }
    if (argumentsList.length >= 7) {
        var milli = await ToNumber(ms);
    } else {
        var milli = 0;
    }
    if (isNaN(y) === false && (0 <= _ToInteger(y)) && (_ToInteger(y) <= 99)) {
        var yr = 1900 + _ToInteger(y);
    } else {
        var yr = y;
    }
    return TimeClip(MakeDate(MakeDay(yr, m, dt), MakeTime(h, min, s, milli)));
}

async function Date_now(thisValue, argumentsList) {
    return nonDeterministicValue(Date.now());
}

async function Date_prototype_toString(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    if (isFinite(t) === false) return "Invalid Date";
    return toISODateString(t) + " " + toISOTimeString(t) + " " + LocalTZAString;
}

async function Date_prototype_toDateString(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    if (isFinite(t) === false) return "Invalid Date";
    return toISODateString(t);
}

async function Date_prototype_toTimeString(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    if (isFinite(t) === false) return "Invalid Date";
    return toISOTimeString(t);
}

async function Date_prototype_toLocaleString(thisValue, argumentsList) {
    return await Date_prototype_toString(thisValue, argumentsList);
}

async function Date_prototype_toLocaleDateString(thisValue, argumentsList) {
    return await Date_prototype_toDateString(thisValue, argumentsList);
}

async function Date_prototype_toLocaleTimeString(thisValue, argumentsList) {
    return await Date_prototype_toTimeString(thisValue, argumentsList);
}

async function Date_prototype_valueOf(thisValue, argumentsList) {
    if (Type(thisValue) !== TYPE_Object || thisValue.Class !== "Date") throw VMTypeError();
    return thisValue.PrimitiveValue;
}

async function Date_prototype_getTime(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    return thisTimeValue;
}

async function Date_prototype_getFullYear(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return YearFromTime(LocalTime(t));
}

async function Date_prototype_getUTCFullYear(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return YearFromTime(t);
}

async function Date_prototype_getMonth(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return MonthFromTime(LocalTime(t));
}

async function Date_prototype_getUTCMonth(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return MonthFromTime(t);
}

async function Date_prototype_getDate(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return DateFromTime(LocalTime(t));
}

async function Date_prototype_getUTCDate(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return DateFromTime(t);
}

async function Date_prototype_getDay(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return WeekDay(LocalTime(t));
}

async function Date_prototype_getUTCDay(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return WeekDay(t);
}

async function Date_prototype_getHours(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return HourFromTime(LocalTime(t));
}

async function Date_prototype_getUTCHours(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return HourFromTime(t);
}

async function Date_prototype_getMinutes(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return MinFromTime(LocalTime(t));
}

async function Date_prototype_getUTCMinutes(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return MinFromTime(t);
}

async function Date_prototype_getSeconds(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return SecFromTime(LocalTime(t));
}

async function Date_prototype_getUTCSeconds(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return SecFromTime(t);
}

async function Date_prototype_getMilliseconds(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return msFromTime(LocalTime(t));
}

async function Date_prototype_getUTCMilliseconds(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return msFromTime(t);
}

async function Date_prototype_getTimezoneOffset(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return (t - LocalTime(t)) / msPerMinute;
}

async function Date_prototype_setTime(thisValue, argumentsList) {
    var time = argumentsList[0];
    if (Type(thisValue) !== TYPE_Object || thisValue.Class !== "Date") throw VMTypeError();
    var v = TimeClip(await ToNumber(time));
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setMilliseconds(thisValue, argumentsList) {
    var ms = argumentsList[0];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var time = MakeTime(HourFromTime(t), MinFromTime(t), SecFromTime(t), await ToNumber(ms));
    var u = TimeClip(UTCTime(MakeDate(Day(t), time)));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCMilliseconds(thisValue, argumentsList) {
    var ms = argumentsList[0];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var time = MakeTime(HourFromTime(t), MinFromTime(t), SecFromTime(t), await ToNumber(ms));
    var v = TimeClip(MakeDate(Day(t), time));
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setSeconds(thisValue, argumentsList) {
    var sec = argumentsList[0];
    var ms = argumentsList[1];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var s = await ToNumber(sec);
    if (argumentsList.length < 2) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), MinFromTime(t), s, milli));
    var u = TimeClip(UTCTime(date));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCSeconds(thisValue, argumentsList) {
    var sec = argumentsList[0];
    var ms = argumentsList[1];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var s = await ToNumber(sec);
    if (argumentsList.length < 2) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), MinFromTime(t), s, milli));
    var v = TimeClip(date);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setMinutes(thisValue, argumentsList) {
    var min = argumentsList[0];
    var sec = argumentsList[1];
    var ms = argumentsList[2];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var m = await ToNumber(min);
    if (argumentsList.length < 2) {
        var s = SecFromTime(t);
    } else {
        var s = await ToNumber(sec);
    }
    if (argumentsList.length < 3) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), m, s, milli));
    var u = TimeClip(UTCTime(date));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCMinutes(thisValue, argumentsList) {
    var min = argumentsList[0];
    var sec = argumentsList[1];
    var ms = argumentsList[2];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var m = await ToNumber(min);
    if (argumentsList.length < 2) {
        var s = SecFromTime(t);
    } else {
        var s = await ToNumber(sec);
    }
    if (argumentsList.length < 3) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(HourFromTime(t), m, s, milli));
    var v = TimeClip(date);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setHours(thisValue, argumentsList) {
    var hour = argumentsList[0];
    var min = argumentsList[1];
    var sec = argumentsList[2];
    var ms = argumentsList[3];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var h = await ToNumber(hour);
    if (argumentsList.length < 2) {
        var m = MinFromTime(t);
    } else {
        var m = await ToNumber(min);
    }
    if (argumentsList.length < 3) {
        var s = SecFromTime(t);
    } else {
        var s = await ToNumber(sec);
    }
    if (argumentsList.length < 4) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(h, m, s, milli));
    var u = TimeClip(UTCTime(date));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCHours(thisValue, argumentsList) {
    var hour = argumentsList[0];
    var min = argumentsList[1];
    var sec = argumentsList[2];
    var ms = argumentsList[3];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var h = await ToNumber(hour);
    if (argumentsList.length < 2) {
        var m = MinFromTime(t);
    } else {
        var m = await ToNumber(min);
    }
    if (argumentsList.length < 3) {
        var s = SecFromTime(t);
    } else {
        var s = await ToNumber(sec);
    }
    if (argumentsList.length < 4) {
        var milli = msFromTime(t);
    } else {
        var milli = await ToNumber(ms);
    }
    var date = MakeDate(Day(t), MakeTime(h, m, s, milli));
    var v = TimeClip(date);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setDate(thisValue, argumentsList) {
    var date = argumentsList[0];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var dt = await ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
    var u = TimeClip(UTCTime(newDate));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCDate(thisValue, argumentsList) {
    var date = argumentsList[0];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var dt = await ToNumber(date);
    var newDate = MakeDate(MakeDay(YearFromTime(t), MonthFromTime(t), dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setMonth(thisValue, argumentsList) {
    var month = argumentsList[0];
    var date = argumentsList[1];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = LocalTime(thisTimeValue);
    var m = await ToNumber(month);
    if (argumentsList.length < 2) {
        var dt = DateFromTime(t);
    } else {
        var dt = await ToNumber(date);
    }
    var newDate = MakeDate(MakeDay(YearFromTime(t), m, dt), TimeWithinDay(t));
    var u = TimeClip(UTCTime(newDate));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCMonth(thisValue, argumentsList) {
    var month = argumentsList[0];
    var date = argumentsList[1];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    var m = await ToNumber(month);
    if (argumentsList.length < 2) {
        var dt = DateFromTime(t);
    } else {
        var dt = await ToNumber(date);
    }
    var newDate = MakeDate(MakeDay(YearFromTime(t), m, dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_setFullYear(thisValue, argumentsList) {
    var year = argumentsList[0];
    var month = argumentsList[1];
    var date = argumentsList[2];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    if (isNaN(thisTimeValue) === false) {
        var t = LocalTime(thisTimeValue);
    } else {
        var t = 0;
    }
    var y = await ToNumber(year);
    if (argumentsList.length < 2) {
        var m = MonthFromTime(t);
    } else {
        var m = await ToNumber(month);
    }
    if (argumentsList.length < 3) {
        var dt = DateFromTime(t);
    } else {
        var dt = await ToNumber(date);
    }
    var newDate = MakeDate(MakeDay(y, m, dt), TimeWithinDay(t));
    var u = TimeClip(UTCTime(newDate));
    thisValue.PrimitiveValue = u;
    return u;
}

async function Date_prototype_setUTCFullYear(thisValue, argumentsList) {
    var year = argumentsList[0];
    var month = argumentsList[1];
    var date = argumentsList[2];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    if (isNaN(thisTimeValue) === false) {
        var t = thisTimeValue;
    } else {
        var t = 0;
    }
    var y = await ToNumber(year);
    if (argumentsList.length < 2) {
        var m = MonthFromTime(t);
    } else {
        var m = await ToNumber(month);
    }
    if (argumentsList.length < 3) {
        var dt = DateFromTime(t);
    } else {
        var dt = await ToNumber(date);
    }
    var newDate = MakeDate(MakeDay(y, m, dt), TimeWithinDay(t));
    var v = TimeClip(newDate);
    thisValue.PrimitiveValue = v;
    return v;
}

async function Date_prototype_toUTCString(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isFinite(t) === false) throw VMRangeError();
    return toISODateString(t) + " " + toISOTimeString(t) + " UTC";
}

async function Date_prototype_toISOString(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isFinite(t) === false) throw VMRangeError();
    return toISODateString(t) + "T" + toISOTimeString(t) + "." + formatNumber(msFromTime(t), 3) + "Z";
}

async function Date_prototype_toJSON(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var tv = await ToPrimitive(O, TYPE_Number);
    if (Type(tv) === TYPE_Number && isFinite(tv) === false) return null;
    var toISO = await O.Get("toISOString");
    if (IsCallable(toISO) === false) throw VMTypeError();
    return await toISO.Call(O, []);
}

async function Date_prototype_getYear(thisValue, argumentsList) {
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    var t = thisTimeValue;
    if (isNaN(t)) return NaN;
    return YearFromTime(LocalTime(t)) - 1900;
}

async function Date_prototype_setYear(thisValue, argumentsList) {
    var year = argumentsList[0];
    var thisTimeValue = await Date_prototype_valueOf(thisValue);
    if (isNaN(thisTimeValue) === false) {
        var t = LocalTime(thisTimeValue);
    } else {
        var t = 0;
    }
    var Result2 = await ToNumber(year);
    if (isNaN(Result2)) {
        thisValue.PrimitiveValue = NaN;
        return NaN;
    }
    if (0 <= _ToInteger(Result2) && _ToInteger(Result2) <= 99) {
        var Result4 = _ToInteger(Result2) + 1900;
    } else {
        var Result4 = Result2;
    }
    var Result5 = MakeDay(Result4, MonthFromTime(t), DateFromTime(t));
    var Result6 = UTCTime(MakeDate(Result5, TimeWithinDay(t)));
    thisValue.PrimitiveValue = TimeClip(Result6);
    return thisValue.PrimitiveValue;
}
