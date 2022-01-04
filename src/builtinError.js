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

// ECMAScript 5.1: 15.11 Error Objects

function VMError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.Error_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMEvalError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.EvalError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMRangeError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.RangeError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMReferenceError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.ReferenceError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMSyntaxError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.SyntaxError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMTypeError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.TypeError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

function VMURIError(message) {
    assert(message === undefined || typeof message === "string", typeof message);
    var obj = VMObject(Class_Error);
    obj.Prototype = realm.URIError_prototype;
    obj.Extensible = true;
    obj.stackTrace = getStackTrace();
    if (message !== undefined) {
        define(obj, "message", message);
    }
    return obj;
}

async function Error_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMError(message);
}

async function Error_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMError(message);
}

async function Error_prototype_toString(thisValue, argumentsList) {
    var O = thisValue;
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var name = await O.Get("name");
    if (name === undefined) {
        var name = "Error";
    } else {
        var name = await ToString(name);
    }
    var msg = await O.Get("message");
    if (msg === undefined) {
        var msg = "";
    } else {
        var msg = await ToString(msg);
    }
    if (name === "") return msg;
    if (msg === "") return name;
    return name + ": " + msg;
}

async function EvalError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMEvalError(message);
}

async function EvalError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMEvalError(message);
}

async function RangeError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMRangeError(message);
}

async function RangeError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMRangeError(message);
}

async function ReferenceError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMReferenceError(message);
}

async function ReferenceError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMReferenceError(message);
}

async function SyntaxError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMSyntaxError(message);
}

async function SyntaxError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMSyntaxError(message);
}

async function TypeError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMTypeError(message);
}

async function TypeError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMTypeError(message);
}

async function URIError_Call(thisValue, argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMURIError(message);
}

async function URIError_Construct(argumentsList) {
    var message = argumentsList[0];
    if (message !== undefined) {
        var message = await ToString(message);
    }
    return VMURIError(message);
}

async function get_Error_prototype_stack(thisValue, argumentsList) {
    if (Type(thisValue) !== TYPE_Object || thisValue.Class !== "Error") throw VMTypeError();
    var stackTrace = thisValue.stackTrace || [];
    var A = [];
    A[0] = await Error_prototype_toString(thisValue, []);
    for (var i = 0; i < stackTrace.length; i++) {
        /* istanbul ignore next */
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var code = stackTrace[i].code;
        var pos = stackTrace[i].pos;
        var info = {};
        Parser.locateDebugInfo(code, pos, info);
        var finfo = info.filename + ":" + info.lineNumber + ":" + info.columnNumber;
        if (info.functionName) {
            finfo = info.functionName + " (" + finfo + ")";
        }
        A[i + 1] = finfo;
    }
    return A.join("\n    at ");
}

async function Error_prototype_getStackTraceEntry(thisValue, argumentsList) {
    var index = await ToUint32(argumentsList[0]);
    var stackTrace = thisValue.stackTrace || [];
    if (stackTrace[index] === undefined) {
        return undefined;
    }
    var func = stackTrace[index].func;
    var code = stackTrace[index].code;
    var pos = stackTrace[index].pos;
    var info = {};
    Parser.locateDebugInfo(code, pos, info);
    var obj = intrinsic_Object();
    define(obj, "functionObject", func);
    define(obj, "functionName", info.functionName);
    define(obj, "filename", info.filename);
    define(obj, "lineNumber", info.lineNumber);
    define(obj, "columnNumber", info.columnNumber);
    return obj;
}
