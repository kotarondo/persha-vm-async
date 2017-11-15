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

// ECMAScript 5.1: 9 Type Conversion and Testing

async function ToPrimitive(input, hint) {
    if (typeof input === "object" && input !== null) {
        return await input.DefaultValue(hint);
    }
    return input;
}

function ToBoolean(input) {
    return Boolean(input);
}

async function ToNumber(input) {
    switch (typeof input) {
        case "object":
            if (input === null) {
                return 0;
            }
            input = await input.DefaultValue(TYPE_Number);
            return await ToNumber(input);
        case "string":
            return ToNumberFromString(input);
    }
    return +(input);
}

function ToNumberFromString(input) {
    assert(typeof input === "string", input);
    var currentPos = 0;
    var current = input[0];
    var lookahead = input[1];
    skipStrWhiteSpaces();
    if (current === undefined) {
        return 0;
    }
    var startPos = currentPos;
    if (current === '0' && (lookahead === 'X' || lookahead === 'x')) {
        proceed(2);
        if (!isHexDigitChar(current)) return NaN;
        while (isHexDigitChar(current)) {
            proceed();
        }
    } else {
        if (current === '+' || current === '-') {
            proceed();
        }
        if (current === 'I' && input.substring(currentPos, currentPos + 8) === "Infinity") {
            proceed(8);
        } else {
            if (current === '.' && !isDecimalDigitChar(lookahead)) return NaN;
            while (isDecimalDigitChar(current)) {
                proceed();
            }
            if (current === '.') {
                proceed();
                while (isDecimalDigitChar(current)) {
                    proceed();
                }
            }
            if (current === 'E' || current === 'e') {
                proceed();
                if (current === '+' || current === '-') {
                    proceed();
                }
                if (!isDecimalDigitChar(current)) return NaN;
                while (isDecimalDigitChar(current)) {
                    proceed();
                }
            }
        }
    }
    var v = Number(input.substring(startPos, currentPos));
    skipStrWhiteSpaces();
    if (current !== undefined) {
        return NaN;
    }
    return v;

    function skipStrWhiteSpaces() {
        while (isWhiteSpace(current) || isLineTerminator(current)) {
            proceed();
        }
    }

    function proceed(count) {
        if (count === undefined) count = 1;
        var c = current;
        while (count-- !== 0) {
            currentPos++;
            current = lookahead;
            lookahead = input[currentPos + 1];
        }
        return c;
    }
}

async function ToInteger(input) {
    var number = await ToNumber(input);
    if (isNaN(number)) return 0;
    if (number === 0) return number;
    if (number < 0) return -Math.floor(-number);
    return Math.floor(number);
}

function _ToInteger(input) {
    assert(typeof input === 'number');
    if (isNaN(number)) return 0;
    if (number === 0) return number;
    if (number < 0) return -Math.floor(-number);
    return Math.floor(number);
}

async function ToInt32(input) {
    var number = await ToNumber(input);
    return (number >> 0);
}

async function ToUint32(input) {
    var number = await ToNumber(input);
    return (number >>> 0);
}

function _ToUint32(input) {
    assert(typeof input === "number", input);
    return (number >>> 0);
}

async function ToUint16(input) {
    var number = await ToNumber(input);
    return ((number >>> 0) & 0xffff);
}

async function ToString(input) {
    if (typeof input === "object" && input !== null) {
        var primValue = await input.DefaultValue(TYPE_String);
        return String(primValue);
    }
    return String(input);
}

async function ToObject(input) {
    switch (typeof input) {
        case "boolean":
            return await Boolean_Construct([input]);
        case "number":
            return await Number_Construct([input]);
        case "string":
            return await String_Construct([input]);
    }
    if (!input) throw VMTypeError();
    return input;
}

function CheckObjectCoercible(input) {
    if (input == null) {
        throw VMTypeError();
    }
}

function IsCallable(input) {
    if (input && input.Call) return true;
    return false;
}

function SameValue(x, y) {
    if ((typeof x) !== (typeof y)) return false;
    if (typeof x === "number") {
        if (x === y) {
            if (x === 0 && 1 / (x * y) === -Infinity) return false;
            return true;
        } else {
            if (isNaN(x) && isNaN(y)) return true;
            return false;
        }
    }
    return (x === y);
}

function ToArrayIndex(P) {
    if (typeof P === "string") {
        var x = +(P);
        if (0 <= x && x <= 0xfffffffe && Math.floor(x) === x && String(x) === P) {
            return x;
        }
        return -1;
    }
    if (0 <= P && P <= 0xfffffffe && Math.floor(P) === P) {
        return P;
    }
    return -1;
}

async function ToPropertyName(x) {
    if (typeof x !== "object") return x;
    if (x === null) return x;
    return String(await x.DefaultValue(TYPE_String));
}
