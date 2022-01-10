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

// ECMAScript 5.1: 15.3 Function Objects

async function Function_Call(thisValue, argumentsList) {
    return await Function_Construct(argumentsList);
}

async function Function_Construct(argumentsList) {
    var argCount = argumentsList.length;
    var P = "";
    if (argCount === 0) {
        var body = "";
    } else if (argCount === 1) {
        var body = argumentsList[0];
    } else {
        var firstArg = argumentsList[0];
        var P = await ToString(firstArg);
        var S = [ P ];
        var ll = P.length;
        var k = 2;
        while (k < argCount) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            if (ll > 1e6) throw VMRangeError("Invalid string length");
            ll += 1;
            var nextArg = argumentsList[k - 1];
            P = await ToString(nextArg);
            S.push(P);
            ll += P.length;
            k++;
        }
        P = S.join();
        var body = argumentsList[k - 1];
    }
    var body = await ToString(body);
    try {
        var code = Parser.readCode("function", P, body, false, "<anonymous>");
    } catch (e) {
        if (e instanceof Parser.SyntaxError) {
            throw VMSyntaxError(e.message);
        }
        if (e instanceof Parser.ReferenceError) {
            throw VMReferenceError(e.message);
        }
        throw e;
    }
    return CreateFunction(code, realm.theGlobalEnvironment);
}

async function Function_prototype_toString(thisValue, argumentsList) {
    var func = thisValue;
    if (IsCallable(func) === false) throw VMTypeError();
    var name = await func.Get("name") || "anonymous";
    while (func.TargetFunction) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        func = func.TargetFunction;
    }
    if (func.Code) {
        var param = func.Code.parameters;
        var startPos = func.Code.startPos;
        var endPos = func.Code.endPos;
        var source = func.Code.sourceObject.source;
        var codeText = source.substring(startPos, endPos);
        var txt = "function " + name + "(" + param + "){" + codeText + "}";
    }else{
        var txt = "function " + name + "(){ native }";
    }
    if (txt.length > 1e6) throw VMRangeError("Invalid string length");
    return txt;
}

async function get_Function_prototype_name(thisValue, argumentsList) {
    var func = thisValue;
    if (IsCallable(func) === false) throw VMTypeError();
    while (func.TargetFunction) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        func = func.TargetFunction;
    }
    if (func.Code) {
        var name = func.Code.functionName;
    }
    if (!name) {
        return "";
    }
    return name;
}

async function Function_prototype_apply(thisValue, argumentsList) {
    var func = thisValue;
    var thisArg = argumentsList[0];
    var argArray = argumentsList[1];
    if (IsCallable(func) === false) throw VMTypeError();
    if (argArray === null || argArray === undefined) return await func.Call(thisArg, []);
    if (typeof argArray !== "object") throw VMTypeError();
    var len = await argArray.Get("length");
    if (typeof len === "number") {
        var n = (len >>> 0);
    } else {
        var n = await ToUint32(len);
    }
    var argList = [];
    var index = 0;
    while (index < n) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var nextArg = await argArray.Get(index);
        argList.push(nextArg);
        index = index + 1;
    }
    return await func.Call(thisArg, argList);
}

async function Function_prototype_call(thisValue, argumentsList) {
    var func = thisValue;
    var thisArg = argumentsList[0];
    if (IsCallable(func) === false) throw VMTypeError();
    var argList = [];
    if (argumentsList.length > 1) {
        for (var i = 1; i < argumentsList.length; i++) {
            if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
            argList.push(argumentsList[i]);
        }
    }
    return await func.Call(thisArg, argList);
}

async function Function_prototype_bind(thisValue, argumentsList) {
    var thisArg = argumentsList[0];
    var Target = thisValue;
    if (IsCallable(Target) === false) throw VMTypeError();
    var A = [];
    for (var i = 1; i < argumentsList.length; i++) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        A.push(argumentsList[i]);
    }
    var F = VMObject(Class_BindFunction);
    F.TargetFunction = Target;
    F.BoundThis = thisArg;
    F.BoundArgs = A;
    F.Prototype = realm.Function_prototype;
    /* istanbul ignore else */
    if (Target.Class === "Function") {
        var L = await Target.Get("length") - A.length;
        defineFinal(F, "length", Math.max(0, L));
    } else {
        defineFinal(F, "length", 0);
    }
    F.Extensible = true;
    var thrower = realm.theThrowTypeError;
    await F.DefineOwnProperty("caller", AccessorPropertyDescriptor(thrower, thrower, false, false), false);
    await F.DefineOwnProperty("arguments", AccessorPropertyDescriptor(thrower, thrower, false, false), false);
    return F;
}

async function BindFunction_ClassCall(thisValue, argumentsList) {
    var F = this;
    var ExtraArgs = argumentsList;
    var boundArgs = F.BoundArgs;
    var boundThis = F.BoundThis;
    var target = F.TargetFunction;
    var args = boundArgs.concat(ExtraArgs);
    return await target.Call(boundThis, args);
}

async function BindFunction_ClassConstruct(argumentsList) {
    var F = this;
    var ExtraArgs = argumentsList;
    var target = F.TargetFunction;
    if (target.Construct === undefined) throw VMTypeError();
    var boundArgs = F.BoundArgs;
    var args = boundArgs.concat(ExtraArgs);
    return await target.Construct(args);
}

async function BindFunction_HasInstance(V) {
    var F = this;
    var target = F.TargetFunction;
    /* istanbul ignore if */
    if (target.HasInstance === undefined) throw VMTypeError();
    return await target.HasInstance(V);
}

async function Function_Get(P) {
    var F = this;
    var v = await default_Get.call(F, P);
    if (P === "caller" && v && v.Class === "Function" && v.Code !== undefined && v.Code.strict) throw VMTypeError();
    return v;
}

async function Function_HasInstance(V) {
    var F = this;
    if (typeof(V) !== 'object' || V === null) return false;
    var O = await F.Get("prototype");
    if (typeof(O) !== 'object' || O === null) throw VMTypeError();
    while (true) {
        if ((stepsLimit -= 10) < 0) throw new ErrorCapsule(VMRangeError("steps overflow"));
        var V = V.Prototype;
        if (V === null) return false;
        if (O === V) return true;
    }
}
