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

function nonDeterministicValue(v) {
    return v;
}

function saveEntireContext() {
    return {
        realm,
        LexicalEnvironment,
        VariableEnvironment,
        ThisBinding,
        runningFunction,
        runningCode,
        runningSourcePos,
        outerExecutionContext,
        stackDepth,
    };
    realm = undefined;
    LexicalEnvironment = undefined;
    VariableEnvironment = undefined;
    ThisBinding = undefined;
    runningFunction = undefined;
    runningCode = undefined;
    runningSourcePos = undefined;
    stackDepth = 0;
}

function restoreEntireContext(ctx) {
    realm = ctx.realm;
    LexicalEnvironment = ctx.LexicalEnvironment;
    VariableEnvironment = ctx.VariableEnvironment;
    ThisBinding = ctx.ThisBinding;
    runningFunction = ctx.runningFunction;
    runningCode = ctx.runningCode;
    runningSourcePos = ctx.runningSourcePos;
    stackDepth = ctx.stackDepth;
}

async function evaluateProgram(text, filename) {
    assert(typeof text === 'string');
    assert(!filename || typeof filename === 'string');
    try {
        var prog = Parser.readCode('global', '', text, false, [], filename);
    } catch (e) {
        if (e instanceof Parser.SyntaxError) {
            throw new SyntaxError(e.message);
        }
        if (e instanceof Parser.ReferenceError) {
            throw new ReferenceError(e.message);
        }
        throw e;
    }
    await enterExecutionContextForGlobalCode(prog);
    try {
        var result = await prog.evaluate();
    } finally {
        exitExecutionContext();
    }
    if (result.type === 'normal') return;
    assert(result.type === 'throw', result);
    throw exportValue(result.value, createDefaultMap());
}

function createDefaultMap() {
    var map = new Map();
    map.set(realm.Object_prototype, Object.prototype);
    map.set(realm.Array_prototype, Array.prototype);
    map.set(realm.String_prototype, String.prototype);
    map.set(realm.Boolean_prototype, Boolean.prototype);
    map.set(realm.Number_prototype, Number.prototype);
    map.set(realm.Date_prototype, Date.prototype);
    map.set(realm.RegExp_prototype, RegExp.prototype);
    map.set(realm.Error_prototype, Error.prototype);
    map.set(realm.EvalError_prototype, EvalError.prototype);
    map.set(realm.RangeError_prototype, RangeError.prototype);
    map.set(realm.ReferenceError_prototype, ReferenceError.prototype);
    map.set(realm.SyntaxError_prototype, SyntaxError.prototype);
    map.set(realm.TypeError_prototype, TypeError.prototype);
    map.set(realm.URIError_prototype, URIError.prototype);
    return map;
}

function exportValue(A, map) {
    if (isPrimitiveValue(A)) {
        return A;
    }
    if (map.has(A)) {
        return map.get(A);
    }
    switch (A.Class) {
        case 'Number':
            var obj = new Number(A.PrimitiveValue);
            break;
        case 'String':
            var obj = new String(A.PrimitiveValue);
            break;
        case 'Boolean':
            var obj = new Boolean(A.PrimitiveValue);
            break;
        case 'Date':
            var obj = new Date(A.PrimitiveValue);
            break;
        case 'RegExp':
            var obj = exportRegExp(A);
            break;
        case 'Error':
            var obj = exportError(A);
            break;
        case 'Function':
            return null;
        case 'Array':
            var obj = new Array();
            map.set(A, obj);
            exportObjectTo(A, obj, map);
            return obj;
        default:
            var obj = new Object();
            map.set(A, obj);
            exportObjectTo(A, obj, map);
            return obj;
    }
    map.set(A, obj);
    return obj;
}

function safe_get_property(O, P) {
    var prop = O.properties[P];
    if (prop !== undefined) return prop;
    var proto = O.Prototype;
    if (proto === null) return undefined;
    return safe_get_property(proto, P);
}

function safe_get_primitive_value(O, P) {
    var prop = safe_get_property(O, P);
    if (prop === undefined) return undefined;
    if (prop.Value === absent) return undefined;
    if (isPrimitiveValue(prop.Value)) {
        return prop.Value;
    }
    return undefined;
}

function exportRegExp(A) {
    var source = safe_get_primitive_value(A, 'source');
    var global = safe_get_primitive_value(A, 'global');
    var ignoreCase = safe_get_primitive_value(A, 'ignoreCase');
    var multiline = safe_get_primitive_value(A, 'multiline');
    var obj = new RegExp(source, (global ? 'g' : '') + (ignoreCase ? 'i' : '') + (multiline ? 'm' : ''));
    obj.lastIndex = safe_get_primitive_value(A, 'lastIndex');
    return obj;
}

function exportError(A) {
    var name = safe_get_primitive_value(A, 'name');
    var msg = safe_get_primitive_value(A, 'message');
    var stackTrace = A.stackTrace;
    switch (name) {
        case 'TypeError':
            var err = new TypeError(msg);
            break;
        case 'ReferenceError':
            var err = new ReferenceError(msg);
            break;
        case 'RangeError':
            var err = new RangeError(msg);
            break;
        case 'SyntaxError':
            var err = new SyntaxError(msg);
            break;
        case 'URIError':
            var err = new URIError(msg);
            break;
        case 'EvalError':
            var err = new EvalError(msg);
            break;
        case 'Error':
            var err = new Error(msg);
            break;
        default:
            var err = new Error(msg);
            Object.defineProperty(err, 'name', {
                value: name,
                writable: true,
                enumerable: false,
                configurable: true,
            });
            break;
    }
    var arr = [];
    if (name === '') arr[0] = msg;
    else if (msg === '') arr[0] = name;
    else arr[0] = name + ': ' + msg;
    for (var i = 0; i < stackTrace.length; i++) {
        var code = stackTrace[i].code;
        var pos = stackTrace[i].pos;
        var info = {};
        Parser.locateDebugInfo(code, pos, info);
        var finfo = info.filename + ':' + info.lineNumber + ':' + info.columnNumber;
        arr[i + 1] = finfo;
        if (info.functionName) {
            arr[i + 1] = info.functionName + ' (' + finfo + ')';
        }
    }
    err.stack = arr.join('\n    at ');
    return err;
}

function exportObjectTo(A, obj, map) {
    Object.setPrototypeOf(obj, null);
    for (var P in A.properties) {
        var desc = A.properties[P];
        if (desc.Value === absent) continue;
        var v = exportValue(desc.Value, map);
        var d = Object.getOwnPropertyDescriptor(obj, P);
        if (d) {
            if (d.writable) obj[P] = v;
            continue;
        }
        Object.defineProperty(obj, P, {
            value: v,
            writable: desc.Writable,
            enumerable: desc.Enumerable,
            configurable: desc.Configurable,
        });
    }
    Object.setPrototypeOf(obj, exportValue(A.Prototype, map));
    return obj;
}
