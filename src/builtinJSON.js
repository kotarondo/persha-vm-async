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

// ECMAScript 5.1: 15.12 The JSON Object

/* istanbul ignore next */
async function JSONParser(text) {
    // placeholder
}

JSONParser = (function() {
    return readJSONText;

    var source;
    var current;
    var currentPos;

    async function readJSONText(text) {
        source = text;
        currentPos = 0;
        current = source[0];
        skipJSONWhiteSpaces();
        var value = await readJSONValue();
        skipJSONWhiteSpaces();
        if (current !== undefined) throw SyntaxError();
        return value;
    }

    async function readJSONValue() {
        if (current === 'n') return readJSONNullLiteral();
        else if (current === 't' || current === 'f') return readJSONBooleanLiteral();
        else if (current === '{') return await readJSONObject();
        else if (current === '[') return await readJSONArray();
        else if (current === '"') return readJSONString();
        return readJSONNumber();
    }

    async function readJSONObject() {
        var obj = intrinsic_Object();
        expecting('{');
        skipJSONWhiteSpaces();
        if (current === '}') {
            proceed();
            return obj;
        }
        while (true) {
            skipJSONWhiteSpaces();
            var key = readJSONString();
            skipJSONWhiteSpaces();
            expecting(':');
            skipJSONWhiteSpaces();
            var value = await readJSONValue();
            var desc = DataPropertyDescriptor(value, true, true, true);
            await obj.DefineOwnProperty(key, desc, false);
            skipJSONWhiteSpaces();
            if (current === '}') {
                proceed();
                return obj;
            }
            expecting(',');
        }
    }

    async function readJSONArray() {
        var obj = intrinsic_Array();
        expecting('[');
        skipJSONWhiteSpaces();
        if (current === ']') {
            proceed();
            return obj;
        }
        var index = 0;
        while (true) {
            skipJSONWhiteSpaces();
            var value = await readJSONValue();
            var desc = DataPropertyDescriptor(value, true, true, true);
            await obj.DefineOwnProperty(index, desc, false);
            index++;
            skipJSONWhiteSpaces();
            if (current === ']') {
                proceed();
                return obj;
            }
            expecting(',');
        }
    }

    function readJSONString() {
        expecting('"');
        var buffer = [];
        while (true) {
            if (current === undefined) throw SyntaxError();
            else if (current === '"') {
                proceed();
                return buffer.join('');
            } else if (current === '\\') {
                var c = readJSONEscapeSequence();
                buffer.push(c);
            } else if (toCharCode(current) <= 0x001F) throw SyntaxError();
            else {
                buffer.push(current);
                proceed();
            }
        }
    }

    function readJSONEscapeSequence() {
        expecting('\\');
        var c = proceed();
        switch (c) {
            case '"':
            case '/':
            case '\\':
                return c;
            case 'b':
                return '\u0008';
            case 'f':
                return '\u000C';
            case 'n':
                return '\u000A';
            case 'r':
                return '\u000D';
            case 't':
                return '\u0009';
            case 'u':
                var x = 0;
                for (var i = 0; i < 4; i++) {
                    if (!isHexDigitChar(current)) throw SyntaxError();
                    x = (x << 4) + mvDigitChar(current);
                    proceed();
                }
                return charCode2String(x);
        }
        throw SyntaxError();
    }

    function readJSONNumber() {
        var startPos = currentPos;
        if (current === '-') {
            proceed();
        }
        if (current === '0') {
            proceed();
            if (isDecimalDigitChar(current)) throw SyntaxError();
        } else {
            if (!isDecimalDigitChar(current)) throw SyntaxError();
            while (isDecimalDigitChar(current)) {
                proceed();
            }
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
            if (!isDecimalDigitChar(current)) throw SyntaxError();
            while (isDecimalDigitChar(current)) {
                proceed();
            }
        }
        /* istanbul ignore if */
        if (startPos === currentPos) throw SyntaxError();
        return Number(source.substring(startPos, currentPos));
    }

    function readJSONNullLiteral() {
        if (source.substring(currentPos, currentPos + 4) === "null") {
            proceed(4);
            return null;
        }
        throw SyntaxError();
    }

    function readJSONBooleanLiteral() {
        if (source.substring(currentPos, currentPos + 4) === "true") {
            proceed(4);
            return true;
        }
        if (source.substring(currentPos, currentPos + 5) === "false") {
            proceed(5);
            return false;
        }
        throw SyntaxError();
    }

    function skipJSONWhiteSpaces() {
        while (true) {
            switch (current) {
                case '\u0009': // <TAB>
                case '\u000D': // <CR>
                case '\u000A': // <LF>
                case '\u0020': // <SP>
                    proceed();
                    break;
                default:
                    return;
            }
        }
    }

    function expecting(c) {
        if (c !== current) throw SyntaxError();
        proceed();
    }

    function proceed(count) {
        var c = current;
        if (count === undefined) {
            count = 1;
        }
        for (var i = 0; i < count; i++) {
            /* istanbul ignore if */
            if (current === undefined) throw SyntaxError();
            current = source[++currentPos];
        }
        return c;
    }

    function SyntaxError() {
        return VMSyntaxError("at " + currentPos);
    }
})();

async function JSON_parse(thisValue, argumentsList) {
    var text = argumentsList[0];
    var reviver = argumentsList[1];
    var JText = await ToString(text);
    /* istanbul ignore next */
    if ((stepsLimit -= 10 * JText.length) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
    var unfiltered = await JSONParser(JText);
    if (IsCallable(reviver) === true) {
        var root = intrinsic_Object();
        defineFree(root, "", unfiltered);
        return await Walk(root, "");
    } else return unfiltered;

    async function Walk(holder, name) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var val = await holder.Get(name);
        if (Type(val) === TYPE_Object) {
            if (val.Class === "Array") {
                var I = 0;
                var len = await val.Get("length");
                while (I < len) {
                    var newElement = await Walk(val, String(I));
                    if (newElement === undefined) {
                        val.Delete(I, false);
                    } else {
                        await val.DefineOwnProperty(I, DataPropertyDescriptor(newElement, true, true, true), false);
                    }
                    I++;
                }
            } else {
                var keys = [];
                var next = val.enumerator(true, true);
                var P;
                while ((P = next()) !== undefined) {
                    /* istanbul ignore next */
                    if ((stepsLimit -= 1) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
                    keys.push(P);
                }
                for (var i = 0; i < keys.length; i++) {
                    var P = keys[i];
                    var newElement = await Walk(val, P);
                    if (newElement === undefined) {
                        val.Delete(P, false);
                    } else {
                        await val.DefineOwnProperty(P, DataPropertyDescriptor(newElement, true, true, true), false);
                    }
                }
            }
        }
        return await reviver.Call(holder, [name, val]);
    }
}

async function JSON_stringify(thisValue, argumentsList) {
    var value = argumentsList[0];
    var replacer = argumentsList[1];
    var space = argumentsList[2];
    var stack = [];
    var indent = "";
    var PropertyList = undefined;
    var ReplacerFunction = undefined;
    if (Type(replacer) === TYPE_Object) {
        if (IsCallable(replacer) === true) {
            var ReplacerFunction = replacer;
        } else if (replacer.Class === "Array") {
            var PropertyList = [];
            var length = await replacer.Get("length");
            /* istanbul ignore next */
            if ((stepsLimit -= 10 * length) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            for (var i = 0; i < length; i++) {
                if (replacer.HasProperty(i) === false) {
                    continue;
                }
                var v = await replacer.Get(i);
                var item = undefined;
                if (Type(v) === TYPE_String) {
                    var item = v;
                } else if (Type(v) === TYPE_Number) {
                    var item = await ToString(v);
                } else if (Type(v) === TYPE_Object) {
                    if (v.Class === "String" || v.Class === "Number") {
                        var item = await ToString(v);
                    }
                }
                if (item !== undefined && isIncluded(item, PropertyList) === false) {
                    PropertyList.push(item);
                }
            }
        }
    }
    if (Type(space) === TYPE_Object) {
        if (space.Class === "Number") {
            var space = await ToNumber(space);
        } else if (space.Class === "String") {
            var space = await ToString(space);
        }
    }
    if (Type(space) === TYPE_Number) {
        var space = Math.min(10, await ToInteger(space));
        var gap = "";
        for (var i = 0; i < space; i++) {
            gap = gap + " ";
        }
    } else if (Type(space) === TYPE_String) {
        if (space.length <= 10) {
            var gap = space;

        } else {
            var gap = space.substring(0, 10);
        }
    } else {
        var gap = "";
    }
    var wrapper = intrinsic_Object();
    defineFree(wrapper, "", value);
    return await Str("", wrapper);

    async function Str(key, holder) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var value = await holder.Get(key);
        if (Type(value) === TYPE_Object) {
            var toJSON = await value.Get("toJSON");
            if (IsCallable(toJSON) === true) {
                var value = await toJSON.Call(value, [key]);
            }
        }
        if (ReplacerFunction !== undefined) {
            var value = await ReplacerFunction.Call(holder, [key, value]);
        }
        if (Type(value) === TYPE_Object) {
            if (value.Class === "Number") {
                var value = await ToNumber(value);
            } else if (value.Class === "String") {
                var value = await ToString(value);
            } else if (value.Class === "Boolean") {
                var value = value.PrimitiveValue;
            }
        }
        if (value === null) return "null";
        if (value === true) return "true";
        if (value === false) return "false";
        if (Type(value) === TYPE_String) return Quote(value);
        if (Type(value) === TYPE_Number) {
            if (isFinite(value)) return await ToString(value);
            else return "null";
        }
        if (Type(value) === TYPE_Object && IsCallable(value) === false) {
            if (value.Class === "Array") return await JA(value);
            else return await JO(value);
        }
        return undefined;
    }

    function Quote(value) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var product = [];
        product.push('"');
        for (var i = 0; i < value.length; i++) {
            /* istanbul ignore next */
            if ((stepsLimit -= 1) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            var C = value[i];
            if (C === '"') {
                product.push('\\"');
            } else if (C === '\\') {
                product.push('\\\\');
            } else if (C === '\b') {
                product.push('\\b');
            } else if (C === '\f') {
                product.push('\\f');
            } else if (C === '\n') {
                product.push('\\n');
            } else if (C === '\r') {
                product.push('\\r');
            } else if (C === '\t') {
                product.push('\\t');
            } else if (toCharCode(C) < 0x20) {
                var x = toCharCode(C);
                var hex = toDigitChar(x >> 12) + toDigitChar(15 & (x >> 8)) + toDigitChar(15 & (x >> 4)) + toDigitChar(15 & x);
                product.push('\\u' + hex);
            } else {
                product.push(C);
            }
        }
        product.push('"');
        return product.join('');
    }

    async function JO(value) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        if (isIncluded(value, stack)) throw VMTypeError();
        stack.push(value);
        var stepback = indent;
        indent = indent + gap;
        if (PropertyList !== undefined) {
            var K = PropertyList;
        } else {
            var K = [];
            var next = value.enumerator(true, true);
            var P;
            while ((P = next()) !== undefined) {
                /* istanbul ignore next */
                if ((stepsLimit -= 1) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
                K.push(P);
            }
        }
        var partial = [];
        for (var i = 0; i < K.length; i++) {
            var P = K[i];
            var strP = await Str(P, value);
            if (strP !== undefined) {
                var member = Quote(P);
                var member = member + ':';
                if (gap !== "") {
                    var member = member + ' ';
                }
                var member = member + strP;
                partial.push(member);
            }
        }
        if (partial.length === 0) {
            var final = "{}";
        } else if (gap === "") {
            var properties = partial.join(',');
            var final = "{" + properties + "}";
        } else {
            var separator = ',' + '\n' + indent;
            var properties = partial.join(separator);
            var final = "{" + '\n' + indent + properties + '\n' + stepback + "}";
        }
        stack.pop();
        indent = stepback;
        return final;
    }

    async function JA(value) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        if (isIncluded(value, stack)) throw VMTypeError();
        stack.push(value);
        var stepback = indent;
        indent = indent + gap;
        var partial = [];
        var len = await value.Get("length");
        var index = 0;
        while (index < len) {
            var strP = await Str(String(index), value);
            if (strP === undefined) {
                partial.push("null");
            } else {
                partial.push(strP);
            }
            index++;
        }
        if (partial.length === 0) {
            var final = "[]";
        } else if (gap === "") {
            var properties = partial.join(',');
            var final = "[" + properties + "]";
        } else {
            var separator = ',' + '\n' + indent;
            var properties = partial.join(separator);
            var final = "[" + '\n' + indent + properties + '\n' + stepback + "]";
        }
        stack.pop();
        indent = stepback;
        return final;
    }
}
