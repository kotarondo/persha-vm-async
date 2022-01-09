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

// ECMAScript 5.1: 15.1 The Global Object

async function Global_eval(thisValue, argumentsList, direct, strict, lexEnv, varEnv, thisB) {
    if (direct === undefined) direct = false;
    if (strict === undefined) strict = false;
    var x = argumentsList[0];
    if (Type(x) !== TYPE_String) return x;
    try {
        var code = Parser.readCode("eval", "", x, strict, "<anonymous>");
    } catch (e) {
        if (e instanceof Parser.SyntaxError) {
            throw VMSyntaxError(e.message);
        }
        if (e instanceof Parser.ReferenceError) {
            throw VMReferenceError(e.message);
        }
        throw e;
    }
    saveExecutionContext();
    try {
        await enterExecutionContextForEvalCode(code, direct, lexEnv, varEnv, thisB);
        var sourceElements = code.sourceElements;
        if (sourceElements === undefined) return;
        var result = await sourceElements.evaluate();
        if (result.type === "normal" && result.value === empty) return;
        if (result.type === "normal") return result.value;
        assert(result.type === "throw", result);
        throw result.value;
    } finally {
        exitExecutionContext();
    }
}

async function Global_parseInt(thisValue, argumentsList) {
    var string = argumentsList[0];
    var radix = argumentsList[1];
    var inputString = await ToString(string);
    if ((stepsLimit -= inputString.length) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var i = 0;
    while (i !== inputString.length && (isWhiteSpace(inputString[i]) || isLineTerminator(inputString[i]))) {
        i++;
    }
    var S = inputString.substring(i);
    var sign = 1;
    if (S !== "" && S[0] === '-') {
        var sign = -1;
    }
    if (S !== "" && (S[0] === '+' || S[0] === '-')) {
        S = S.substring(1);
    }
    var R = await ToInt32(radix);
    var stripPrefix = true;
    if (R !== 0) {
        if ((R < 2) || (R > 36)) return NaN;
        if (R !== 16) {
            var stripPrefix = false;
        }
    } else {
        var R = 10;
    }
    if (stripPrefix === true) {
        if ((S.length >= 2) && (S.substring(0, 2) === "0x" || S.substring(0, 2) === "0X")) {
            S = S.substring(2);
            var R = 16;
        }
    }
    var i = 0;
    while (i !== S.length && (mvDigitChar(S[i]) < R)) {
        i++;
    }
    var Z = S.substring(0, i);
    if (Z === "") return NaN;
    var number = parseInt(Z, R);
    return sign * number;
}

async function Global_parseFloat(thisValue, argumentsList) {
    var string = argumentsList[0];
    var inputString = await ToString(string);
    if ((stepsLimit -= inputString.length) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var i = 0;
    while (i !== inputString.length && (isWhiteSpace(inputString[i]) || isLineTerminator(inputString[i]))) {
        i++;
    }
    var trimmedString = inputString.substring(i);
    return parseFloat(trimmedString);
}

async function Global_isNaN(thisValue, argumentsList) {
    var number = argumentsList[0];
    return isNaN(await ToNumber(number));
}

async function Global_isFinite(thisValue, argumentsList) {
    var number = argumentsList[0];
    return isFinite(await ToNumber(number));
}

function Encode(string, unescapedSet) {
    var strLen = string.length;
    if ((stepsLimit -= 10*strLen) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var R = "";
    var k = 0;
    while (true) {
        if (k === strLen) return R;
        var C = string[k];
        if (isIncluded(C, unescapedSet)) {
            var S = C;
            var R = R + S;
        } else {
            if ((toCharCode(C) >= 0xDC00) && (toCharCode(C) <= 0xDFFF)) throw VMURIError();
            if ((toCharCode(C) < 0xD800) || (toCharCode(C) > 0xDBFF)) {
                var V = toCharCode(C);
            } else {
                k++;
                if (k === strLen) throw VMURIError();
                var kChar = toCharCode(string[k]);
                if ((kChar < 0xDC00) || (kChar > 0xDFFF)) throw VMURIError();
                var V = ((toCharCode(C) - 0xD800) * 0x400 + (kChar - 0xDC00) + 0x10000);
            }
            var Octets = UTF8encode(V);
            var L = Octets.length;
            for (var j = 0; j < L; j++) {
                var jOctet = Octets[j];
                var S = '%' + toUpperDigitChar(jOctet >> 4) + toUpperDigitChar(jOctet & 15);
                var R = R + S;
            }
        }
        k++;
    }
}

function Decode(string, reservedSet) {
    var strLen = string.length;
    if ((stepsLimit -= strLen) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var R = "";
    var k = 0;
    while (true) {
        if (k === strLen) return R;
        var C = string[k];
        if (C !== '%') {
            var S = C;
        } else {
            var start = k;
            if (k + 2 >= strLen) throw VMURIError();
            if ((isHexDigitChar(string[k + 1]) && isHexDigitChar(string[k + 2])) === false) throw VMURIError();
            var B = (mvDigitChar(string[k + 1]) << 4) + mvDigitChar(string[k + 2]);
            k += 2;
            if ((B & 0x80) === 0) {
                var C = charCode2String(B);
                if (isIncluded(C, reservedSet) === false) {
                    var S = C;
                } else {
                    var S = string.substring(start, k + 1);
                }
            } else {
                var n = 0;
                while (((B << n) & 0x80) !== 0) {
                    n++;
                }
                if (n === 1 || (n > 4)) throw VMURIError();
                var Octets = [];
                Octets[0] = B;
                if (k + (3 * (n - 1)) >= strLen) throw VMURIError();
                for (var j = 1; j < n; j++) {
                    k++;
                    if (string[k] !== '%') throw VMURIError();
                    if ((isHexDigitChar(string[k + 1]) && isHexDigitChar(string[k + 2])) === false) throw VMURIError();
                    var B = (mvDigitChar(string[k + 1]) << 4) + mvDigitChar(string[k + 2]);
                    if ((B & 0xC0) !== 0x80) throw VMURIError();
                    k += 2;
                    Octets[j] = B;
                }
                var V = UTF8decode(Octets);
                if (V < 0x10000) {
                    var C = charCode2String(V);
                    /* istanbul ignore else */
                    if (isIncluded(C, reservedSet) === false) {
                        var S = C;
                    } else {
                        var S = string.substring(start, k + 1);
                    }
                } else {
                    var L = (((V - 0x10000) & 0x3FF) + 0xDC00);
                    var H = ((((V - 0x10000) >> 10) & 0x3FF) + 0xD800);
                    var S = charCode2String(H) + charCode2String(L);
                }
            }
        }
        var R = R + S;
        k++;
    }
}

function UTF8encode(V) {
    var Octets = [];
    if (V <= 0x007F) {
        Octets[0] = V;
    } else if (V <= 0x07FF) {
        Octets[0] = 0xC0 + ((V >> 6) & 0x1F);
        Octets[1] = 0x80 + (V & 0x3F);
    } else if (V <= 0xFFFF) {
        Octets[0] = 0xE0 + ((V >> 12) & 0x1F);
        Octets[1] = 0x80 + ((V >> 6) & 0x3F);
        Octets[2] = 0x80 + (V & 0x3F);
    } else {
        Octets[0] = 0xF0 + ((V >> 18) & 0x07);
        Octets[1] = 0x80 + ((V >> 12) & 0x3F);
        Octets[2] = 0x80 + ((V >> 6) & 0x3F);
        Octets[3] = 0x80 + (V & 0x3F);
    }
    return Octets;
}

function UTF8decode(Octets) {
    var len = Octets.length;
    if (len === 2) {
        var V = ((Octets[0] & 0x1F) << 6) + (Octets[1] & 0x3F);
        if (V <= 0x007F) throw VMURIError();
    } else if (len === 3) {
        var V = ((Octets[0] & 0x0F) << 12) + ((Octets[1] & 0x3F) << 6) + (Octets[2] & 0x3F);
        if ((V <= 0x07FF) || ((0xD800 <= V) && (V <= 0xDFFF))) throw VMURIError();
    } else {
        var V = ((Octets[0] & 0x07) << 18) + ((Octets[1] & 0x3F) << 12) + ((Octets[2] & 0x3F) << 6) + (Octets[3] & 0x3F);
        if ((V <= 0xFFFF) || (0x110000 <= V)) throw VMURIError();
    }
    return V;
}

async function Global_decodeURI(thisValue, argumentsList) {
    var encodedURI = argumentsList[0];
    var uriString = await ToString(encodedURI);
    var reservedURISet = ";/?:@&=+$,#";
    return Decode(uriString, reservedURISet);
}

async function Global_decodeURIComponent(thisValue, argumentsList) {
    var encodedURIComponent = argumentsList[0];
    var componentString = await ToString(encodedURIComponent);
    var reservedURIComponentSet = "";
    return Decode(componentString, reservedURIComponentSet);
}

async function Global_encodeURI(thisValue, argumentsList) {
    var uri = argumentsList[0];
    var uriString = await ToString(uri);
    var unescapedURISet = ";/?:@&=+$,abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.!~*'()#";
    return Encode(uriString, unescapedURISet);
}

async function Global_encodeURIComponent(thisValue, argumentsList) {
    var uriComponent = argumentsList[0];
    var componentString = await ToString(uriComponent);
    var unescapedURIComponentSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.!~*'()";
    return Encode(componentString, unescapedURIComponentSet);
}

async function Global_escape(thisValue, argumentsList) {
    var string = argumentsList[0];
    var Result1 = await ToString(string);
    var Result2 = Result1.length;
    if ((stepsLimit -= 5*Result2) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var R = [];
    var k = 0;
    while (true) {
        if (k === Result2) return R.join('');
        var Result6 = Result1[k];
        if (!isIncluded(Result6, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@*_+-./")) {
            var x = toCharCode(Result6);
            if (x >= 256) {
                var S = "%u" + toUpperDigitChar(x >> 12) + toUpperDigitChar((x >> 8) & 15) + toUpperDigitChar((x >> 4) & 15) +
                    toUpperDigitChar(x & 15);
            } else {
                var S = "%" + toUpperDigitChar(x >> 4) + toUpperDigitChar(x & 15);
            }
        } else {
            var S = Result6;
        }
        R.push(S);
        k++;
    }
}

async function Global_unescape(thisValue, argumentsList) {
    var string = argumentsList[0];
    var Result1 = await ToString(string);
    var Result2 = Result1.length;
    if ((stepsLimit -= Result2) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var R = [];
    var k = 0;
    while (true) {
        if (k === Result2) return R.join('');
        var c = Result1[k];
        if (c === '%') {
            if ((k <= Result2 - 6) && Result1[k + 1] === 'u' && isHexDigitChar(Result1[k + 2]) &&
                isHexDigitChar(Result1[k + 3]) && isHexDigitChar(Result1[k + 4]) && isHexDigitChar(Result1[k + 5])) {
                var c = charCode2String((mvDigitChar(Result1[k + 2]) << 12) + (mvDigitChar(Result1[k + 3]) << 8) +
                    (mvDigitChar(Result1[k + 4]) << 4) + mvDigitChar(Result1[k + 5]));
                k += 5;
            } else if ((k <= Result2 - 3) && isHexDigitChar(Result1[k + 1]) && isHexDigitChar(Result1[k + 2])) {
                var c = charCode2String((mvDigitChar(Result1[k + 1]) << 4) + mvDigitChar(Result1[k + 2]));
                k += 2;
            }
        }
        R.push(c);
        k++;
    }
}
