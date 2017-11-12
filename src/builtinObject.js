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

// ECMAScript 5.1: 15.2 Object Objects

async function Object_Call(thisValue, argumentsList) {
    var value = argumentsList[0];
    if (value === null || value === undefined) return await Object_Construct(argumentsList);
    return await ToObject(value);
}

async function Object_Construct(argumentsList) {
    var value = argumentsList[0];
    if (argumentsList.length >= 1) {
        if (Type(value) === TYPE_Object) return value;
        if (Type(value) === TYPE_String) return await ToObject(value);
        if (Type(value) === TYPE_Boolean) return await ToObject(value);
        if (Type(value) === TYPE_Number) return await ToObject(value);
    }
    return intrinsic_Object();
}

function intrinsic_Object() {
    var obj = VMObject(Class_Object);
    obj.Prototype = realm.Object_prototype;
    obj.Extensible = true;
    return obj;
}

async function Object_getPrototypeOf(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    return O.Prototype;
}

async function Object_getOwnPropertyDescriptor(thisValue, argumentsList) {
    var O = argumentsList[0];
    var P = argumentsList[1];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var name = await ToString(P);
    var desc = O.GetOwnProperty(name);
    return FromPropertyDescriptor(desc);
}

async function Object_getOwnPropertyNames(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, false);
    var array = intrinsic_Array();
    var n = 0;
    var P;
    while ((P = next()) !== undefined) {
        await array.DefineOwnProperty(n, DataPropertyDescriptor(P, true, true, true), false);
        n++;
    }
    return array;
}

async function Object_create(thisValue, argumentsList) {
    var O = argumentsList[0];
    var Properties = argumentsList[1];
    if (Type(O) !== TYPE_Object && Type(O) !== TYPE_Null) throw VMTypeError();
    var obj = await Object_Construct([]);
    obj.Prototype = O;
    if (Properties !== undefined) {
        await Object_defineProperties(null, [obj, Properties]);
    }
    return obj;
}

async function Object_defineProperty(thisValue, argumentsList) {
    var O = argumentsList[0];
    var P = argumentsList[1];
    var Attributes = argumentsList[2];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var name = await ToString(P);
    var desc = await ToPropertyDescriptor(Attributes);
    await O.DefineOwnProperty(name, desc, true);
    return O;
}

async function Object_defineProperties(thisValue, argumentsList) {
    var O = argumentsList[0];
    var Properties = argumentsList[1];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var props = await ToObject(Properties);
    var names = props.enumerator(true, true);
    var descriptors = [];
    var P;
    while ((P = names()) !== undefined) {
        var descObj = await props.Get(P);
        var desc = await ToPropertyDescriptor(descObj);
        descriptors.push([P, desc]);
    }
    for (var i = 0; i < descriptors.length; i++) {
        var pair = descriptors[i];
        var P = pair[0];
        var desc = pair[1];
        await O.DefineOwnProperty(P, desc, true);
    }
    return O;
}

async function Object_seal(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, false);
    var P;
    while ((P = next()) !== undefined) {
        var desc = O.GetOwnProperty(P);
        if (desc.Configurable === true) {
            var desc = FullPropertyDescriptor(desc.Value, desc.Writable, desc.Get, desc.Set, desc.Enumerable, false);
        }
        await O.DefineOwnProperty(P, desc, true);
    }
    O.Extensible = false;
    return O;
}

async function Object_freeze(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, false);
    var P;
    while ((P = next()) !== undefined) {
        var desc = O.GetOwnProperty(P);
        var desc = FullPropertyDescriptor(desc.Value, (desc.Writable === true) ? false : desc.Writable, desc.Get, desc.Set,
            desc.Enumerable, false);
        await O.DefineOwnProperty(P, desc, true);
    }
    O.Extensible = false;
    return O;
}

async function Object_preventExtensions(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    O.Extensible = false;
    return O;
}

async function Object_isSealed(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, false);
    var P;
    while ((P = next()) !== undefined) {
        var desc = O.GetOwnProperty(P);
        if (desc.Configurable === true) return false;
    }
    if (O.Extensible === false) return true;
    return false;
}

async function Object_isFrozen(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, false);
    var P;
    while ((P = next()) !== undefined) {
        var desc = O.GetOwnProperty(P);
        if (IsDataDescriptor(desc) === true) {
            if (desc.Writable === true) return false;
        }
        if (desc.Configurable === true) return false;
    }
    if (O.Extensible === false) return true;
    return false;
}

async function Object_isExtensible(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    return O.Extensible;
}

async function Object_keys(thisValue, argumentsList) {
    var O = argumentsList[0];
    if (Type(O) !== TYPE_Object) throw VMTypeError();
    var next = O.enumerator(true, true);
    var array = intrinsic_Array();
    var n = 0;
    var P;
    while ((P = next()) !== undefined) {
        await array.DefineOwnProperty(n, DataPropertyDescriptor(P, true, true, true), false);
        n++;
    }
    return array;
}

async function Object_prototype_toString(thisValue, argumentsList) {
    if (thisValue === undefined) return "[object Undefined]";
    if (thisValue === null) return "[object Null]";
    var O = await ToObject(thisValue);
    return "[object " + O.Class + "]";
}

async function Object_prototype_toLocaleString(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    var toString = await O.Get("toString");
    if (IsCallable(toString) === false) throw VMTypeError();
    return await toString.Call(O, []);
}

async function Object_prototype_valueOf(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    return O;
}

async function Object_prototype_hasOwnProperty(thisValue, argumentsList) {
    var V = argumentsList[0];
    var P = await ToString(V);
    var O = await ToObject(thisValue);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) return false;
    return true;
}

async function Object_prototype_isPrototypeOf(thisValue, argumentsList) {
    var V = argumentsList[0];
    if (Type(V) !== TYPE_Object) return false;
    var O = await ToObject(thisValue);
    while (true) {
        var V = V.Prototype;
        if (V === null) return false;
        if (O === V) return true;
    }
}

async function Object_prototype_propertyIsEnumerable(thisValue, argumentsList) {
    var V = argumentsList[0];
    var P = await ToString(V);
    var O = await ToObject(thisValue);
    var desc = O.GetOwnProperty(P);
    if (desc === undefined) return false;
    return desc.Enumerable;
}

async function get_Object_prototype___proto__(thisValue, argumentsList) {
    var O = await ToObject(thisValue);
    return O.Prototype;
}

async function set_Object_prototype___proto__(thisValue, argumentsList) {
    var proto = argumentsList[0];
    CheckObjectCoercible(thisValue);
    var O = thisValue;
    if (proto !== null && Type(proto) !== TYPE_Object) return undefined;
    if (Type(O) !== TYPE_Object) return undefined;
    if (O.Extensible === false) throw VMTypeError();
    var current = O.Prototype;
    if (proto === current) return undefined;
    var p = proto;
    while (p !== null) {
        if (p === O) return undefined;
        p = p.Prototype;
    }
    O.Prototype = proto;
    return undefined;
}
