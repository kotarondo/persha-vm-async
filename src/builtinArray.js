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

// ECMAScript 5.1: 15.4 Array Objects

async function Array_Call(thisValue, argumentsList) {
    return await Array_Construct(argumentsList);
}

async function Array_Construct(argumentsList) {
    var obj = VMObject(Class_Array);
    obj.Prototype = realm.Array_prototype;
    obj.Extensible = true;
    if (argumentsList.length !== 1) {
        defineWritable(obj, "length", argumentsList.length);
        for (var i = 0; i < argumentsList.length; i++) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            defineFree(obj, i, argumentsList[i]);
        }
    } else {
        var len = argumentsList[0];
        if (Type(len) === TYPE_Number && _ToUint32(len) === len) {
            defineWritable(obj, "length", _ToUint32(len));
        }
        if (Type(len) === TYPE_Number && _ToUint32(len) !== len) throw VMRangeError();
        if (Type(len) !== TYPE_Number) {
            defineWritable(obj, "length", 1);
            defineFree(obj, 0, len);
        }
    }
    return obj;
}

function intrinsic_Array() {
    var obj = VMObject(Class_Array);
    obj.Prototype = realm.Array_prototype;
    obj.Extensible = true;
    defineWritable(obj, "length", 0);
    return obj;
}

async function Array_isArray(thisValue, argumentsList) {
    var arg = argumentsList[0];
    if (Type(arg) !== TYPE_Object) return false;
    if (arg.Class === "Array") return true;
    return false;
}

async function Array_prototype_toString(thisValue, argumentsList) {
    var array = await ToObject(thisValue);
    var func = await array.Get("join");
    if (IsCallable(func) === false) return await Object_prototype_toString(array, []);
    return await func.Call(array, []);
}

async function Array_prototype_toLocaleString(thisValue, argumentsList) {
    var array = await ToObject(thisValue);
    var arrayLen = await array.Get("length");
    var len = await ToUint32(arrayLen);
    var separator = ',';
    if (len === 0) return "";
    var firstElement = await array.Get(0);
    if (firstElement === undefined || firstElement === null) {
        var R = "";
    } else {
        var elementObj = await ToObject(firstElement);
        var func = await elementObj.Get("toLocaleString");
        if (IsCallable(func) === false) throw VMTypeError();
        // specification Bug 62
        var R = await func.Call(firstElement, []);
        var R = await ToString(R);
        // end of bug fix
    }
    var k = 1;
    var S = [R];
    var ll = R.length;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        if (ll > 1e6) throw VMRangeError("Invalid string length");
        ll += separator.length;
        var nextElement = await array.Get(k);
        if (nextElement === undefined || nextElement === null) {
            var R = "";
        } else {
            var elementObj = await ToObject(nextElement);
            var func = await elementObj.Get("toLocaleString");
            if (IsCallable(func) === false) throw VMTypeError();
            // specification Bug 62
            var R = await func.Call(nextElement, []);
            var R = await ToString(R);
            // end of bug fix
        }
        S.push(R);
        ll += R.length;
        k++;
    }
    return S.join(separator);
}

async function Array_prototype_concat(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var A = intrinsic_Array();
    var n = 0;
    var items = [O].concat(argumentsList);
    for (var i = 0; i < items.length; i++) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var E = items[i];
        if (Type(E) === TYPE_Object && E.Class === "Array") {
            var k = 0;
            var len = await E.Get("length");
            while (k < len) {
                if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
                var P = k;
                var exists = E.HasProperty(P);
                if (exists === true) {
                    var subElement = await E.Get(P);
                    await A.DefineOwnProperty(n, DataPropertyDescriptor(subElement, true, true, true), false);
                }
                n++;
                k++;
            }
        } else {
            await A.DefineOwnProperty(n, DataPropertyDescriptor(E, true, true, true), false);
            n++;
        }
    }
    // specification Bug 129
    await A.Put("length", n, true);
    // end of bug fix
    return A;
}

async function Array_prototype_join(thisValue, argumentsList) {
    var separator = argumentsList[0];
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    if (separator === undefined) {
        var separator = ",";
    }
    var sep = await ToString(separator);
    if (len === 0) return "";
    var element0 = await O.Get(0);
    if (element0 === undefined || element0 === null) {
        var R = "";
    } else {
        var R = await ToString(element0);
    }
    var k = 1;
    var S = [R];
    var ll = R.length;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        if (ll > 1e6) throw VMRangeError("Invalid string length");
        ll += sep.length;
        var element = await O.Get(k);
        if (element === undefined || element === null) {
            var next = "";
        } else {
            var next = await ToString(element);
        }
        S.push(next);
        ll += next.length;
        k++;
    }
    return S.join(sep);
}

async function Array_prototype_pop(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    if (len === 0) {
        await O.Put("length", 0, true);
        return;
    } else {
        var indx = len - 1;
        var element = await O.Get(indx);
        O.Delete(indx, true);
        // specification Bug 162
        await O.Put("length", len - 1, true);
        // end of bug fix
        return element;
    }
}

async function Array_prototype_push(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var n = await ToUint32(lenVal);
    var items = argumentsList;
    for (var i = 0; i < items.length; i++) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var E = items[i];
        await O.Put(n, E, true);
        n++;
    }
    await O.Put("length", n, true);
    return n;
}

async function Array_prototype_reverse(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    var middle = Math.floor(len / 2);
    var lower = 0;
    while (lower !== middle) {
        if ((stepsLimit -= 70) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var upper = len - lower - 1;
        var upperP = upper;
        var lowerP = lower;
        var lowerValue = await O.Get(lowerP);
        var upperValue = await O.Get(upperP);
        var lowerExists = O.HasProperty(lowerP);
        var upperExists = O.HasProperty(upperP);
        if (lowerExists === true && upperExists === true) {
            await O.Put(lowerP, upperValue, true);
            await O.Put(upperP, lowerValue, true);
        } else if (lowerExists === false && upperExists === true) {
            await O.Put(lowerP, upperValue, true);
            O.Delete(upperP, true);
        } else if (lowerExists === true && upperExists === false) {
            O.Delete(lowerP, true);
            await O.Put(upperP, lowerValue, true);
        }
        lower++;
    }
    return O;
}

async function Array_prototype_shift(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    if (len === 0) {
        await O.Put("length", 0, true);
        return;
    }
    var first = await O.Get(0);
    var k = 1;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var from = k;
        var to = k - 1;
        var fromPresent = O.HasProperty(from);
        if (fromPresent === true) {
            var fromVal = await O.Get(from);
            await O.Put(to, fromVal, true);
        } else {
            O.Delete(to, true);
        }
        k++;
    }
    O.Delete(len - 1, true);
    await O.Put("length", len - 1, true);
    return first;
}

async function Array_prototype_slice(thisValue, argumentsList) {
    var start = argumentsList[0];
    var end = argumentsList[1];
    var O = await ToObject(thisValue);
    var A = intrinsic_Array();
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    var relativeStart = await ToInteger(start);
    if (relativeStart < 0) {
        var k = Math.max((len + relativeStart), 0);
    } else {
        var k = Math.min(relativeStart, len);
    }
    if (end === undefined) {
        var relativeEnd = len;
    } else {
        var relativeEnd = await ToInteger(end);
    }
    if (relativeEnd < 0) {
        var final = Math.max((len + relativeEnd), 0);
    } else {
        var final = Math.min(relativeEnd, len);
    }
    var n = 0;
    while (k < final) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            await A.DefineOwnProperty(n, DataPropertyDescriptor(kValue, true, true, true), false);
        }
        k++;
        n++;
    }
    // specification Bug 417
    await A.Put("length", n, true);
    // end of bug fix
    return A;
}

async function Array_prototype_sort(thisValue, argumentsList) {
    var comparefn = argumentsList[0];
    var obj = await ToObject(thisValue);
    var len = await ToUint32(await obj.Get("length"));
    var perm = [];
    if ((stepsLimit -= 10 * len) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    for (var i = 0; i < len; i++) {
        perm[i] = i;
    }
    var perm = await qsort(perm);
    var result = [];
    for (var i = 0; i < len; i++) {
        var P = perm[i];
        if (obj.HasProperty(P) === false) {
            break;
        }
        result[i] = await obj.Get(P);
    }
    for (var i = 0; i < len; i++) {
        var P = i;
        if (i < result.length) {
            await obj.Put(P, result[i], true);
        } else {
            obj.Delete(P, true);
        }
    }
    return obj;

    async function qsort(perm) {
        var l = perm.length;
        if (l <= 1) return perm;
        var lower = [];
        var same = [];
        var higher = [];
        var p = perm[l >>> 1];
        for (var i = 0; i < l; i++) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var q = perm[i];
            var c = (q === p) ? 0 : await SortCompare(q, p);
            if (c < 0) {
                lower.push(q);
            } else if (c > 0) {
                higher.push(q);
            } else {
                same.push(q);
            }
        }
        var lower = await qsort(lower);
        var higher = await qsort(higher);
        return lower.concat(same, higher);
    }

    async function SortCompare(j, k) {
        var jString = j;
        var kString = k;
        var hasj = obj.HasProperty(jString);
        var hask = obj.HasProperty(kString);
        if (hasj === false && hask === false) return 0;
        if (hasj === false) return 1;
        if (hask === false) return -1;
        var x = await obj.Get(jString);
        var y = await obj.Get(kString);
        if (x === undefined && y === undefined) return 0;
        if (x === undefined) return 1;
        if (y === undefined) return -1;
        if (comparefn !== undefined) {
            if (IsCallable(comparefn) === false) throw VMTypeError();
            return await comparefn.Call(undefined, [x, y]);
        }
        var xString = await ToString(x);
        var yString = await ToString(y);
        if (xString < yString) return -1;
        if (xString > yString) return 1;
        return 0;
    }
}

async function Array_prototype_splice(thisValue, argumentsList) {
    var start = argumentsList[0];
    var deleteCount = argumentsList[1];
    var O = await ToObject(thisValue);
    var A = intrinsic_Array();
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    var relativeStart = await ToInteger(start);
    if (relativeStart < 0) {
        var actualStart = Math.max((len + relativeStart), 0);
    } else {
        var actualStart = Math.min(relativeStart, len);
    }
    if (argumentsList.length === 1) {
        var actualDeleteCount = len - actualStart; // compatible with ECMA6
    } else {
        var actualDeleteCount = Math.min(Math.max(await ToInteger(deleteCount), 0), len - actualStart);
    }
    var k = 0;
    while (k < actualDeleteCount) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var from = actualStart + k;
        var fromPresent = O.HasProperty(from);
        if (fromPresent === true) {
            var fromValue = await O.Get(from);
            await A.DefineOwnProperty(k, DataPropertyDescriptor(fromValue, true, true, true), false);
        }
        k++;
    }
    // specification Bug 332
    await A.Put("length", actualDeleteCount, true);
    // end of bug fix
    var itemCount = argumentsList.length - 2;
    if (itemCount < 0) {
        itemCount = 0;
    }
    if (itemCount < actualDeleteCount) {
        var k = actualStart;
        while (k < (len - actualDeleteCount)) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var from = k + actualDeleteCount;
            var to = k + itemCount;
            var fromPresent = O.HasProperty(from);
            if (fromPresent === true) {
                var fromValue = await O.Get(from);
                await O.Put(to, fromValue, true);
            } else {
                O.Delete(to, true);
            }
            k++;
        }
        var k = len;
        while (k > (len - actualDeleteCount + itemCount)) {
            if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            O.Delete(k - 1, true);
            k--;
        }
    } else if (itemCount > actualDeleteCount) {
        var k = (len - actualDeleteCount);
        while (k > actualStart) {
            if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var from = k + actualDeleteCount - 1;
            var to = k + itemCount - 1;
            var fromPresent = O.HasProperty(from);
            if (fromPresent === true) {
                var fromValue = await O.Get(from);
                await O.Put(to, fromValue, true);
            } else {
                O.Delete(to, true);
            }
            k--;
        }
    }
    var k = actualStart;
    for (var i = 2; i < argumentsList.length; i++) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var E = argumentsList[i];
        await O.Put(k, E, true);
        k++;
    }
    await O.Put("length", (len - actualDeleteCount + itemCount), true);
    return A;
}

async function Array_prototype_unshift(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var lenVal = await O.Get("length");
    var len = await ToUint32(lenVal);
    var argCount = argumentsList.length;
    var k = len;
    while (k > 0) {
        if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var from = k - 1;
        var to = k + argCount - 1;
        var fromPresent = O.HasProperty(from);
        if (fromPresent === true) {
            var fromValue = await O.Get(from);
            await O.Put(to, fromValue, true);
        } else {
            O.Delete(to, true);
        }
        k--;
    }
    var j = 0;
    var items = argumentsList;
    while (j !== items.length) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var E = items[j];
        await O.Put(j, E, true);
        j++;
    }
    await O.Put("length", len + argCount, true);
    return len + argCount;
}

async function Array_prototype_indexOf(thisValue, argumentsList) {
    var searchElement = argumentsList[0];
    var fromIndex = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (len === 0) return -1;
    if (argumentsList.length >= 2) {
        var n = await ToInteger(fromIndex);
    } else {
        var n = 0;
    }
    if (n >= len) return -1;
    if (n >= 0) {
        var k = n;
    } else {
        var k = len - Math.abs(n);
        if (k < 0) {
            var k = 0;
        }
    }
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var kPresent = O.HasProperty(k);
        if (kPresent === true) {
            var elementK = await O.Get(k);
            var same = (searchElement === elementK);
            if (same === true) return k;
        }
        k++;
    }
    return -1;
}

async function Array_prototype_lastIndexOf(thisValue, argumentsList) {
    var searchElement = argumentsList[0];
    var fromIndex = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (len === 0) return -1;
    if (argumentsList.length >= 2) {
        var n = await ToInteger(fromIndex);
    } else {
        var n = len - 1;
    }
    if (n >= 0) {
        var k = Math.min(n, len - 1);
    } else {
        var k = len - Math.abs(n);
    }
    while (k >= 0) {
        if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var kPresent = O.HasProperty(k);
        if (kPresent === true) {
            var elementK = await O.Get(k);
            var same = (searchElement === elementK);
            if (same === true) return k;
        }
        k--;
    }
    return -1;
}

async function Array_prototype_every(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var thisArg = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (argumentsList.length >= 2) {
        var T = thisArg;
    } else {
        var T = undefined;
    }
    var k = 0;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var testResult = await callbackfn.Call(T, [kValue, k, O]);
            if (ToBoolean(testResult) === false) return false;
        }
        k++;
    }
    return true;
}

async function Array_prototype_some(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var thisArg = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (argumentsList.length >= 2) {
        var T = thisArg;
    } else {
        var T = undefined;
    }
    var k = 0;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var testResult = await callbackfn.Call(T, [kValue, k, O]);
            if (ToBoolean(testResult) === true) return true;
        }
        k++;
    }
    return false;
}

async function Array_prototype_forEach(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var thisArg = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (argumentsList.length >= 2) {
        var T = thisArg;
    } else {
        var T = undefined;
    }
    var k = 0;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            await callbackfn.Call(T, [kValue, k, O]);
        }
        k++;
    }
    return;
}

async function Array_prototype_map(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var thisArg = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (argumentsList.length >= 2) {
        var T = thisArg;
    } else {
        var T = undefined;
    }
    var A = await Array_Construct([len]);
    var k = 0;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var mappedValue = await callbackfn.Call(T, [kValue, k, O]);
            await A.DefineOwnProperty(Pk, DataPropertyDescriptor(mappedValue, true, true, true), false);
        }
        k++;
    }
    return A;
}

async function Array_prototype_filter(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var thisArg = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (argumentsList.length >= 2) {
        var T = thisArg;
    } else {
        var T = undefined;
    }
    var A = intrinsic_Array();
    var k = 0;
    var to = 0;
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var selected = await callbackfn.Call(T, [kValue, k, O]);
            if (ToBoolean(selected) === true) {
                await A.DefineOwnProperty(to, DataPropertyDescriptor(kValue, true, true, true), false);
                to++;
            }
        }
        k++;
    }
    return A;
}

async function Array_prototype_reduce(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var initialValue = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (len === 0 && (argumentsList.length < 2)) throw VMTypeError();
    var k = 0;
    if (argumentsList.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && (k < len)) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var Pk = k;
            var kPresent = O.HasProperty(Pk);
            if (kPresent === true) {
                var accumulator = await O.Get(Pk);
            }
            k++;
        }
        if (kPresent === false) throw VMTypeError();
    }
    while (k < len) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var accumulator = await callbackfn.Call(undefined, [accumulator, kValue, k, O]);
        }
        k++;
    }
    return accumulator;
}

async function Array_prototype_reduceRight(thisValue, argumentsList) {
    var callbackfn = argumentsList[0];
    var initialValue = argumentsList[1];
    var O = await ToObject(thisValue);
    var lenValue = await O.Get("length");
    var len = await ToUint32(lenValue);
    if (IsCallable(callbackfn) === false) throw VMTypeError();
    if (len === 0 && (argumentsList.length < 2)) throw VMTypeError();
    var k = len - 1;
    if (argumentsList.length >= 2) {
        var accumulator = initialValue;
    } else {
        var kPresent = false;
        while (kPresent === false && (k >= 0)) {
            if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var Pk = k;
            var kPresent = O.HasProperty(Pk);
            if (kPresent === true) {
                var accumulator = await O.Get(Pk);
            }
            k--;
        }
        if (kPresent === false) throw VMTypeError();
    }
    while (k >= 0) {
        if ((stepsLimit -= 30) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var Pk = k;
        var kPresent = O.HasProperty(Pk);
        if (kPresent === true) {
            var kValue = await O.Get(Pk);
            var accumulator = await callbackfn.Call(undefined, [accumulator, kValue, k, O]);
        }
        k--;
    }
    return accumulator;
}

async function Array_DefineOwnProperty(P, Desc, Throw) {
    var A = this;
    var oldLenDesc = A.GetOwnProperty("length");
    var oldLen = oldLenDesc.Value;
    if (P === "length") {
        if (Desc.Value === absent) return await default_DefineOwnProperty.call(A, "length", Desc, Throw);
        var newLen = await ToUint32(Desc.Value);
        if (newLen !== await ToNumber(Desc.Value)) throw VMRangeError();
        var newLenDesc = DataPropertyDescriptor(newLen, Desc.Writable, Desc.Enumerable, Desc.Configurable);
        if (newLen >= oldLen) return await default_DefineOwnProperty.call(A, "length", newLenDesc, Throw);
        if (oldLenDesc.Writable === false) {
            /* istanbul ignore else */
            if (Throw === true) throw VMTypeError();
            else return false;
        }
        if (newLenDesc.Writable === absent || newLenDesc.Writable === true) {
            var newWritable = true;
        } else {
            var newWritable = false;
            var newLenDesc = DataPropertyDescriptor(newLenDesc.Value, true, newLenDesc.Enumerable, newLenDesc.Configurable);
        }
        var succeeded = await default_DefineOwnProperty.call(A, "length", newLenDesc, Throw);
        /* istanbul ignore if */
        if (succeeded === false) return false;
        while (newLen < oldLen) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            oldLen = oldLen - 1;
            var deleteSucceeded = A.Delete(oldLen, false);
            if (deleteSucceeded === false) {
                var newLenDesc = DataPropertyDescriptor(oldLen + 1, newWritable ? newLenDesc.Writable : false,
                    newLenDesc.Enumerable, newLenDesc.Configurable);
                await default_DefineOwnProperty.call(A, "length", newLenDesc, false);
                /* istanbul ignore else */
                if (Throw === true) throw VMTypeError();
                else return false;
            }
        }
        if (newWritable === false) {
            await default_DefineOwnProperty.call(A, "length", DataPropertyDescriptor(absent, false, absent, absent), false);
        }
        return true;
    }
    var index = ToArrayIndex(P);
    if (index >= 0) {
        if ((index >= oldLen) && oldLenDesc.Writable === false) {
            if (Throw === true) throw VMTypeError();
            else return false;
        }
        var succeeded = await default_DefineOwnProperty.call(A, P, Desc, false);
        if (succeeded === false) {
            /* istanbul ignore else */
            if (Throw === true) throw VMTypeError();
            else return false;
        }
        if (index >= oldLen) {
            var oldLenDesc = DataPropertyDescriptor(index + 1, oldLenDesc.Writable, oldLenDesc.Enumerable,
                oldLenDesc.Configurable);
            await default_DefineOwnProperty.call(A, "length", oldLenDesc, false);
        }
        return true;
    }
    return await default_DefineOwnProperty.call(A, P, Desc, Throw);
}

async function Array_FastPut(P, V, Throw) {
    var O = this;
    var ownDesc = O.properties[P];
    if (P === "length") {
        if (ownDesc.Writable === false) {
            if (Throw === true) throw VMTypeError();
            else return;
        }
        var oldLen = ownDesc.Value;
        V = await ToNumber(V);
        var newLen = await ToUint32(V);
        if (newLen !== V) throw VMRangeError();
        if (oldLen - newLen > 2 * O.numProps) {
            for (var P in O.properties) {
                if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
                var index = ToArrayIndex(P);
                if (index >= newLen) {
                    if (O.properties[P].Configurable === false) {
                        newLen = index + 1;
                    }
                }
            }
            ownDesc.Value = newLen;
            for (var P in O.properties) {
                if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
                var index = ToArrayIndex(P);
                if (index >= newLen) {
                    intrinsic_remove(O, P);
                }
            }
            return;
        }
        ownDesc.Value = newLen;
        while (newLen < oldLen) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            oldLen = oldLen - 1;
            var deleteSucceeded = O.Delete(oldLen, false);
            if (deleteSucceeded === false) {
                ownDesc.Value = oldLen + 1;
                if (Throw === true) throw VMTypeError();
                else return;
            }
        }
        return;
    }
    if (ownDesc) {
        if (ownDesc.Writable === true) {
            ownDesc.Value = V;
            return;
        }
    } else if (O.Extensible) {
        var proto = O.Prototype;
        if (proto === null || proto.GetProperty(P) === undefined) {
            var index = ToArrayIndex(P);
            if (index >= 0) {
                var oldLenDesc = O.properties["length"];
                var oldLen = oldLenDesc.Value;
                if (index >= oldLen) {
                    if (oldLenDesc.Writable === false) {
                        if (Throw === true) throw VMTypeError();
                        else return;
                    }
                    oldLenDesc.Value = index + 1;
                }
            }
            intrinsic_createData(O, P, V, true, true, true);
            return;
        }
    }
    await default_Put.call(O, P, V, Throw);
}
