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

// ECMAScript 5.1: 15 Standard Built-in ECMAScript Objects

var realm;

function createRealmObject(realmC) {
    var { predefined } = realmC;
    var deleted = Object.create(null);
    var target = Object.create(null);
    var proxyHandler = {
        getOwnPropertyDescriptor: function(target, P) {
            var v = proxyHandler.get(target, P);
            if (!v) return undefined;
            return { value: v, writable: true, enumerable: true, configurable: true };
        },
        has: function(target, P) {
            assert(false, 'proxy');
        },
        get: function(target, P) {
            var v = target[P];
            if (v) return v;
            if (deleted[P]) return undefined;
            var v = predefined[P];
            if (v) target[P] = v;
            return v;
        },
        deleteProperty: function(target, P) {
            if (P in predefined) deleted[P] = true;
            delete target[P];
            return true;
        },
        ownKeys: function(target) {
            var list = [];
            for (var P in predefined) {
                if (!deleted[P]) list.push(P);
            }
            for (var P in target) {
                if (deleted[P] || !(P in predefined)) list.push(P);
            }
            return list;
        },
    };
    var obj = Object.create(realmC.Class);
    obj.properties = new Proxy(target, proxyHandler);
    obj.Prototype = null;
    obj.Extensible = true;
    obj.numProps = 0;
    return obj;
}

function RealmClass(Class) {
    var predefined = Object.create(null);
    return { Class, predefined };
}

function intrinsic_realmCreateData(O, P, Value, Writable, Enumerable, Configurable) {
    Object.defineProperty(O.predefined, P, { get: getf, enumerable: true, configurable: true });

    function getf() {
        return { Value, Writable, Get: absent, Set: absent, Enumerable, Configurable };
    }
}

function intrinsic_realmCreateDataRefRealm(O, P, Value, Writable, Enumerable, Configurable) {
    Object.defineProperty(O.predefined, P, { get: getf, enumerable: true, configurable: true });

    function getf() {
        assert(realm[Value], Value);
        return { Value: realm[Value], Writable, Get: absent, Set: absent, Enumerable, Configurable };
    }
}

function realmDefineFunction(O, P, length, func) {
    Object.defineProperty(O.predefined, P, { get: getf, enumerable: true, configurable: true });

    function getf() {
        var F = VMObject(Class_BuiltinFunction);
        F.Prototype = realm.Function_prototype;
        F.Extensible = true;
        defineCall(F, func);
        defineFinal(F, "length", length);
        defineFinal(F, "name", P);
        return { Value: F, Writable: true, Get: absent, Set: absent, Enumerable: false, Configurable: true };
    }
}

function realmDefineAccessor(O, P, get, set) {
    Object.defineProperty(O.predefined, P, { get: getf, enumerable: true, configurable: true });

    function getf() {
        if (get !== undefined) {
            var Get = VMObject(Class_BuiltinFunction);
            Get.Prototype = realm.Function_prototype;
            Get.Extensible = true;
            defineCall(Get, get);
            defineFinal(Get, "length", 0);
            defineFinal(Get, "name", "get " + P);
        }
        if (set !== undefined) {
            var Set = VMObject(Class_BuiltinFunction);
            Set.Prototype = realm.Function_prototype;
            Set.Extensible = true;
            defineCall(Set, set);
            defineFinal(Set, "length", 1);
            defineFinal(Set, "name", "set " + P);
        }
        return { Value: absent, Writable: absent, Get, Set, Enumerable: false, Configurable: true };
    }
}

function realmDefine(obj, name, value) {
    intrinsic_realmCreateData(obj, name, value, true, false, true);
}

function realmDefineFinal(obj, name, value) {
    intrinsic_realmCreateData(obj, name, value, false, false, false);
}

function realmDefineWritable(obj, name, value) {
    intrinsic_realmCreateData(obj, name, value, true, false, false);
}

function realmDefineRefRealm(obj, name, value) {
    intrinsic_realmCreateDataRefRealm(obj, name, value, true, false, true);
}

function realmDefineFinalRefRealm(obj, name, value) {
    intrinsic_realmCreateDataRefRealm(obj, name, value, false, false, false);
}

function initializeRealmClass() {
    var realmC = {};

    realmC.Object_prototype = RealmClass(Class_Object);
    realmC.Function_prototype = RealmClass(Class_BuiltinFunction);
    realmC.Array_prototype = RealmClass(Class_Array);
    realmC.String_prototype = RealmClass(Class_String);
    realmC.Boolean_prototype = RealmClass(Class_Boolean);
    realmC.Number_prototype = RealmClass(Class_Number);
    realmC.Date_prototype = RealmClass(Class_Date);
    realmC.RegExp_prototype = RealmClass(Class_RegExp);
    realmC.Error_prototype = RealmClass(Class_Error);
    realmC.EvalError_prototype = RealmClass(Class_Error);
    realmC.RangeError_prototype = RealmClass(Class_Error);
    realmC.ReferenceError_prototype = RealmClass(Class_Error);
    realmC.SyntaxError_prototype = RealmClass(Class_Error);
    realmC.TypeError_prototype = RealmClass(Class_Error);
    realmC.URIError_prototype = RealmClass(Class_Error);
    realmC.Object = RealmClass(Class_BuiltinFunction);
    realmC.Function = RealmClass(Class_BuiltinFunction);
    realmC.Array = RealmClass(Class_BuiltinFunction);
    realmC.String = RealmClass(Class_BuiltinFunction);
    realmC.Boolean = RealmClass(Class_BuiltinFunction);
    realmC.Number = RealmClass(Class_BuiltinFunction);
    realmC.Math = RealmClass(Class_Math);
    realmC.Date = RealmClass(Class_BuiltinFunction);
    realmC.RegExp = RealmClass(Class_BuiltinFunction);
    realmC.Error = RealmClass(Class_BuiltinFunction);
    realmC.EvalError = RealmClass(Class_BuiltinFunction);
    realmC.RangeError = RealmClass(Class_BuiltinFunction);
    realmC.ReferenceError = RealmClass(Class_BuiltinFunction);
    realmC.SyntaxError = RealmClass(Class_BuiltinFunction);
    realmC.TypeError = RealmClass(Class_BuiltinFunction);
    realmC.URIError = RealmClass(Class_BuiltinFunction);
    realmC.JSON = RealmClass(Class_JSON);
    realmC.theGlobalObject = RealmClass(Class_Global);

    realmDefineFinal(realmC.theGlobalObject, "NaN", NaN);
    realmDefineFinal(realmC.theGlobalObject, "Infinity", Infinity);
    realmDefineFinal(realmC.theGlobalObject, "undefined", undefined);
    realmDefineFunction(realmC.theGlobalObject, "eval", 1, Global_eval);
    realmDefineFunction(realmC.theGlobalObject, "parseInt", 2, Global_parseInt);
    realmDefineFunction(realmC.theGlobalObject, "parseFloat", 1, Global_parseFloat);
    realmDefineFunction(realmC.theGlobalObject, "isNaN", 1, Global_isNaN);
    realmDefineFunction(realmC.theGlobalObject, "isFinite", 1, Global_isFinite);
    realmDefineFunction(realmC.theGlobalObject, "decodeURI", 1, Global_decodeURI);
    realmDefineFunction(realmC.theGlobalObject, "decodeURIComponent", 1, Global_decodeURIComponent);
    realmDefineFunction(realmC.theGlobalObject, "encodeURI", 1, Global_encodeURI);
    realmDefineFunction(realmC.theGlobalObject, "encodeURIComponent", 1, Global_encodeURIComponent);
    realmDefineFunction(realmC.theGlobalObject, "escape", 1, Global_escape);
    realmDefineFunction(realmC.theGlobalObject, "unescape", 1, Global_unescape);
    realmDefineRefRealm(realmC.theGlobalObject, "Object", "Object");
    realmDefineRefRealm(realmC.theGlobalObject, "Function", "Function");
    realmDefineRefRealm(realmC.theGlobalObject, "Array", "Array");
    realmDefineRefRealm(realmC.theGlobalObject, "String", "String");
    realmDefineRefRealm(realmC.theGlobalObject, "Boolean", "Boolean");
    realmDefineRefRealm(realmC.theGlobalObject, "Number", "Number");
    realmDefineRefRealm(realmC.theGlobalObject, "Math", "Math");
    realmDefineRefRealm(realmC.theGlobalObject, "Date", "Date");
    realmDefineRefRealm(realmC.theGlobalObject, "RegExp", "RegExp");
    realmDefineRefRealm(realmC.theGlobalObject, "Error", "Error");
    realmDefineRefRealm(realmC.theGlobalObject, "EvalError", "EvalError");
    realmDefineRefRealm(realmC.theGlobalObject, "RangeError", "RangeError");
    realmDefineRefRealm(realmC.theGlobalObject, "ReferenceError", "ReferenceError");
    realmDefineRefRealm(realmC.theGlobalObject, "SyntaxError", "SyntaxError");
    realmDefineRefRealm(realmC.theGlobalObject, "TypeError", "TypeError");
    realmDefineRefRealm(realmC.theGlobalObject, "URIError", "URIError");
    realmDefineRefRealm(realmC.theGlobalObject, "JSON", "JSON");

    realmDefineFinal(realmC.Object, "length", 1);
    realmDefineFinalRefRealm(realmC.Object, "prototype", "Object_prototype");
    realmDefineFunction(realmC.Object, "getPrototypeOf", 1, Object_getPrototypeOf);
    realmDefineFunction(realmC.Object, "getOwnPropertyDescriptor", 2, Object_getOwnPropertyDescriptor);
    realmDefineFunction(realmC.Object, "getOwnPropertyNames", 1, Object_getOwnPropertyNames);
    realmDefineFunction(realmC.Object, "create", 2, Object_create);
    realmDefineFunction(realmC.Object, "defineProperty", 3, Object_defineProperty);
    realmDefineFunction(realmC.Object, "defineProperties", 2, Object_defineProperties);
    realmDefineFunction(realmC.Object, "seal", 1, Object_seal);
    realmDefineFunction(realmC.Object, "freeze", 1, Object_freeze);
    realmDefineFunction(realmC.Object, "preventExtensions", 1, Object_preventExtensions);
    realmDefineFunction(realmC.Object, "isSealed", 1, Object_isSealed);
    realmDefineFunction(realmC.Object, "isFrozen", 1, Object_isFrozen);
    realmDefineFunction(realmC.Object, "isExtensible", 1, Object_isExtensible);
    realmDefineFunction(realmC.Object, "keys", 1, Object_keys);
    realmDefineRefRealm(realmC.Object_prototype, "constructor", "Object");
    realmDefineFunction(realmC.Object_prototype, "toString", 0, Object_prototype_toString);
    realmDefineFunction(realmC.Object_prototype, "toLocaleString", 0, Object_prototype_toLocaleString);
    realmDefineFunction(realmC.Object_prototype, "valueOf", 0, Object_prototype_valueOf);
    realmDefineFunction(realmC.Object_prototype, "hasOwnProperty", 1, Object_prototype_hasOwnProperty);
    realmDefineFunction(realmC.Object_prototype, "isPrototypeOf", 1, Object_prototype_isPrototypeOf);
    realmDefineFunction(realmC.Object_prototype, "propertyIsEnumerable", 1, Object_prototype_propertyIsEnumerable);
    realmDefineAccessor(realmC.Object_prototype, "__proto__", get_Object_prototype___proto__, set_Object_prototype___proto__);

    realmDefineFinal(realmC.Function, "length", 1);
    realmDefineFinalRefRealm(realmC.Function, "prototype", "Function_prototype");
    realmDefineFinal(realmC.Function_prototype, "length", 0);
    realmDefineRefRealm(realmC.Function_prototype, "constructor", "Function");
    realmDefineFunction(realmC.Function_prototype, "toString", 0, Function_prototype_toString);
    realmDefineFunction(realmC.Function_prototype, "apply", 2, Function_prototype_apply);
    realmDefineFunction(realmC.Function_prototype, "call", 1, Function_prototype_call);
    realmDefineFunction(realmC.Function_prototype, "bind", 1, Function_prototype_bind);
    realmDefineAccessor(realmC.Function_prototype, "name", get_Function_prototype_name, undefined);

    realmDefineFinal(realmC.Array, "length", 1);
    realmDefineFinalRefRealm(realmC.Array, "prototype", "Array_prototype");
    realmDefineFunction(realmC.Array, "isArray", 1, Array_isArray);
    realmDefineWritable(realmC.Array_prototype, "length", 0);
    realmDefineRefRealm(realmC.Array_prototype, "constructor", "Array");
    realmDefineFunction(realmC.Array_prototype, "toString", 0, Array_prototype_toString);
    realmDefineFunction(realmC.Array_prototype, "toLocaleString", 0, Array_prototype_toLocaleString);
    realmDefineFunction(realmC.Array_prototype, "concat", 1, Array_prototype_concat);
    realmDefineFunction(realmC.Array_prototype, "join", 1, Array_prototype_join);
    realmDefineFunction(realmC.Array_prototype, "pop", 0, Array_prototype_pop);
    realmDefineFunction(realmC.Array_prototype, "push", 1, Array_prototype_push);
    realmDefineFunction(realmC.Array_prototype, "reverse", 0, Array_prototype_reverse);
    realmDefineFunction(realmC.Array_prototype, "shift", 0, Array_prototype_shift);
    realmDefineFunction(realmC.Array_prototype, "slice", 2, Array_prototype_slice);
    realmDefineFunction(realmC.Array_prototype, "sort", 1, Array_prototype_sort);
    realmDefineFunction(realmC.Array_prototype, "splice", 2, Array_prototype_splice);
    realmDefineFunction(realmC.Array_prototype, "unshift", 1, Array_prototype_unshift);
    realmDefineFunction(realmC.Array_prototype, "indexOf", 1, Array_prototype_indexOf);
    realmDefineFunction(realmC.Array_prototype, "lastIndexOf", 1, Array_prototype_lastIndexOf);
    realmDefineFunction(realmC.Array_prototype, "every", 1, Array_prototype_every);
    realmDefineFunction(realmC.Array_prototype, "some", 1, Array_prototype_some);
    realmDefineFunction(realmC.Array_prototype, "forEach", 1, Array_prototype_forEach);
    realmDefineFunction(realmC.Array_prototype, "map", 1, Array_prototype_map);
    realmDefineFunction(realmC.Array_prototype, "filter", 1, Array_prototype_filter);
    realmDefineFunction(realmC.Array_prototype, "reduce", 1, Array_prototype_reduce);
    realmDefineFunction(realmC.Array_prototype, "reduceRight", 1, Array_prototype_reduceRight);

    realmDefineFinal(realmC.String, "length", 1);
    realmDefineFinalRefRealm(realmC.String, "prototype", "String_prototype");
    realmDefineFunction(realmC.String, "fromCharCode", 1, String_fromCharCode);
    realmDefineFinal(realmC.String_prototype, "length", 0);
    realmDefineRefRealm(realmC.String_prototype, "constructor", "String");
    realmDefineFunction(realmC.String_prototype, "toString", 0, String_prototype_toString);
    realmDefineFunction(realmC.String_prototype, "valueOf", 0, String_prototype_valueOf);
    realmDefineFunction(realmC.String_prototype, "charAt", 1, String_prototype_charAt);
    realmDefineFunction(realmC.String_prototype, "charCodeAt", 1, String_prototype_charCodeAt);
    realmDefineFunction(realmC.String_prototype, "concat", 1, String_prototype_concat);
    realmDefineFunction(realmC.String_prototype, "indexOf", 1, String_prototype_indexOf);
    realmDefineFunction(realmC.String_prototype, "lastIndexOf", 1, String_prototype_lastIndexOf);
    realmDefineFunction(realmC.String_prototype, "localeCompare", 1, String_prototype_localeCompare);
    realmDefineFunction(realmC.String_prototype, "match", 1, String_prototype_match);
    realmDefineFunction(realmC.String_prototype, "replace", 2, String_prototype_replace);
    realmDefineFunction(realmC.String_prototype, "search", 1, String_prototype_search);
    realmDefineFunction(realmC.String_prototype, "slice", 2, String_prototype_slice);
    realmDefineFunction(realmC.String_prototype, "split", 2, String_prototype_split);
    realmDefineFunction(realmC.String_prototype, "substring", 2, String_prototype_substring);
    realmDefineFunction(realmC.String_prototype, "toLowerCase", 0, String_prototype_toLowerCase);
    realmDefineFunction(realmC.String_prototype, "toLocaleLowerCase", 0, String_prototype_toLocaleLowerCase);
    realmDefineFunction(realmC.String_prototype, "toUpperCase", 0, String_prototype_toUpperCase);
    realmDefineFunction(realmC.String_prototype, "toLocaleUpperCase", 0, String_prototype_toLocaleUpperCase);
    realmDefineFunction(realmC.String_prototype, "trim", 0, String_prototype_trim);
    realmDefineFunction(realmC.String_prototype, "substr", 2, String_prototype_substr);

    realmDefineFinal(realmC.Boolean, "length", 1);
    realmDefineFinalRefRealm(realmC.Boolean, "prototype", "Boolean_prototype");
    realmDefineRefRealm(realmC.Boolean_prototype, "constructor", "Boolean");
    realmDefineFunction(realmC.Boolean_prototype, "toString", 0, Boolean_prototype_toString);
    realmDefineFunction(realmC.Boolean_prototype, "valueOf", 0, Boolean_prototype_valueOf);

    realmDefineFinal(realmC.Number, "length", 1);
    realmDefineFinalRefRealm(realmC.Number, "prototype", "Number_prototype");
    realmDefineFinal(realmC.Number, "MAX_VALUE", Number.MAX_VALUE);
    realmDefineFinal(realmC.Number, "MIN_VALUE", Number.MIN_VALUE);
    realmDefineFinal(realmC.Number, "NaN", NaN);
    realmDefineFinal(realmC.Number, "POSITIVE_INFINITY", Infinity);
    realmDefineFinal(realmC.Number, "NEGATIVE_INFINITY", -Infinity);
    realmDefineRefRealm(realmC.Number_prototype, "constructor", "Number");
    realmDefineFunction(realmC.Number_prototype, "toString", 0, Number_prototype_toString);
    realmDefineFunction(realmC.Number_prototype, "toLocaleString", 0, Number_prototype_toLocaleString);
    realmDefineFunction(realmC.Number_prototype, "valueOf", 0, Number_prototype_valueOf);
    realmDefineFunction(realmC.Number_prototype, "toFixed", 1, Number_prototype_toFixed);
    realmDefineFunction(realmC.Number_prototype, "toExponential", 1, Number_prototype_toExponential);
    realmDefineFunction(realmC.Number_prototype, "toPrecision", 1, Number_prototype_toPrecision);

    realmDefineFinal(realmC.Math, "E", Math.E);
    realmDefineFinal(realmC.Math, "LN10", Math.LN10);
    realmDefineFinal(realmC.Math, "LN2", Math.LN2);
    realmDefineFinal(realmC.Math, "LOG2E", Math.LOG2E);
    realmDefineFinal(realmC.Math, "LOG10E", Math.LOG10E);
    realmDefineFinal(realmC.Math, "PI", Math.PI);
    realmDefineFinal(realmC.Math, "SQRT1_2", Math.SQRT1_2);
    realmDefineFinal(realmC.Math, "SQRT2", Math.SQRT2);
    realmDefineFunction(realmC.Math, "abs", 1, Math_abs);
    realmDefineFunction(realmC.Math, "acos", 1, Math_acos);
    realmDefineFunction(realmC.Math, "asin", 1, Math_asin);
    realmDefineFunction(realmC.Math, "atan", 1, Math_atan);
    realmDefineFunction(realmC.Math, "atan2", 2, Math_atan2);
    realmDefineFunction(realmC.Math, "ceil", 1, Math_ceil);
    realmDefineFunction(realmC.Math, "cos", 1, Math_cos);
    realmDefineFunction(realmC.Math, "exp", 1, Math_exp);
    realmDefineFunction(realmC.Math, "floor", 1, Math_floor);
    realmDefineFunction(realmC.Math, "log", 1, Math_log);
    realmDefineFunction(realmC.Math, "max", 2, Math_max);
    realmDefineFunction(realmC.Math, "min", 2, Math_min);
    realmDefineFunction(realmC.Math, "pow", 2, Math_pow);
    realmDefineFunction(realmC.Math, "random", 0, Math_random);
    realmDefineFunction(realmC.Math, "round", 1, Math_round);
    realmDefineFunction(realmC.Math, "sin", 1, Math_sin);
    realmDefineFunction(realmC.Math, "sqrt", 1, Math_sqrt);
    realmDefineFunction(realmC.Math, "tan", 1, Math_tan);

    realmDefineFinal(realmC.Date, "length", 7);
    realmDefineFinalRefRealm(realmC.Date, "prototype", "Date_prototype");
    realmDefineFunction(realmC.Date, "parse", 1, Date_parse);
    realmDefineFunction(realmC.Date, "UTC", 7, Date_UTC);
    realmDefineFunction(realmC.Date, "now", 0, Date_now);
    realmDefineRefRealm(realmC.Date_prototype, "constructor", "Date");
    realmDefineFunction(realmC.Date_prototype, "toString", 0, Date_prototype_toString);
    realmDefineFunction(realmC.Date_prototype, "toDateString", 0, Date_prototype_toDateString);
    realmDefineFunction(realmC.Date_prototype, "toTimeString", 0, Date_prototype_toTimeString);
    realmDefineFunction(realmC.Date_prototype, "toLocaleString", 0, Date_prototype_toLocaleString);
    realmDefineFunction(realmC.Date_prototype, "toLocaleDateString", 0, Date_prototype_toLocaleDateString);
    realmDefineFunction(realmC.Date_prototype, "toLocaleTimeString", 0, Date_prototype_toLocaleTimeString);
    realmDefineFunction(realmC.Date_prototype, "valueOf", 0, Date_prototype_valueOf);
    realmDefineFunction(realmC.Date_prototype, "getTime", 0, Date_prototype_getTime);
    realmDefineFunction(realmC.Date_prototype, "getFullYear", 0, Date_prototype_getFullYear);
    realmDefineFunction(realmC.Date_prototype, "getUTCFullYear", 0, Date_prototype_getUTCFullYear);
    realmDefineFunction(realmC.Date_prototype, "getMonth", 0, Date_prototype_getMonth);
    realmDefineFunction(realmC.Date_prototype, "getUTCMonth", 0, Date_prototype_getUTCMonth);
    realmDefineFunction(realmC.Date_prototype, "getDate", 0, Date_prototype_getDate);
    realmDefineFunction(realmC.Date_prototype, "getUTCDate", 0, Date_prototype_getUTCDate);
    realmDefineFunction(realmC.Date_prototype, "getDay", 0, Date_prototype_getDay);
    realmDefineFunction(realmC.Date_prototype, "getUTCDay", 0, Date_prototype_getUTCDay);
    realmDefineFunction(realmC.Date_prototype, "getHours", 0, Date_prototype_getHours);
    realmDefineFunction(realmC.Date_prototype, "getUTCHours", 0, Date_prototype_getUTCHours);
    realmDefineFunction(realmC.Date_prototype, "getMinutes", 0, Date_prototype_getMinutes);
    realmDefineFunction(realmC.Date_prototype, "getUTCMinutes", 0, Date_prototype_getUTCMinutes);
    realmDefineFunction(realmC.Date_prototype, "getSeconds", 0, Date_prototype_getSeconds);
    realmDefineFunction(realmC.Date_prototype, "getUTCSeconds", 0, Date_prototype_getUTCSeconds);
    realmDefineFunction(realmC.Date_prototype, "getMilliseconds", 0, Date_prototype_getMilliseconds);
    realmDefineFunction(realmC.Date_prototype, "getUTCMilliseconds", 0, Date_prototype_getUTCMilliseconds);
    realmDefineFunction(realmC.Date_prototype, "getTimezoneOffset", 0, Date_prototype_getTimezoneOffset);
    realmDefineFunction(realmC.Date_prototype, "setTime", 1, Date_prototype_setTime);
    realmDefineFunction(realmC.Date_prototype, "setMilliseconds", 1, Date_prototype_setMilliseconds);
    realmDefineFunction(realmC.Date_prototype, "setUTCMilliseconds", 1, Date_prototype_setUTCMilliseconds);
    realmDefineFunction(realmC.Date_prototype, "setSeconds", 2, Date_prototype_setSeconds);
    realmDefineFunction(realmC.Date_prototype, "setUTCSeconds", 2, Date_prototype_setUTCSeconds);
    realmDefineFunction(realmC.Date_prototype, "setMinutes", 3, Date_prototype_setMinutes);
    realmDefineFunction(realmC.Date_prototype, "setUTCMinutes", 3, Date_prototype_setUTCMinutes);
    realmDefineFunction(realmC.Date_prototype, "setHours", 4, Date_prototype_setHours);
    realmDefineFunction(realmC.Date_prototype, "setUTCHours", 4, Date_prototype_setUTCHours);
    realmDefineFunction(realmC.Date_prototype, "setDate", 1, Date_prototype_setDate);
    realmDefineFunction(realmC.Date_prototype, "setUTCDate", 1, Date_prototype_setUTCDate);
    realmDefineFunction(realmC.Date_prototype, "setMonth", 2, Date_prototype_setMonth);
    realmDefineFunction(realmC.Date_prototype, "setUTCMonth", 2, Date_prototype_setUTCMonth);
    realmDefineFunction(realmC.Date_prototype, "setFullYear", 3, Date_prototype_setFullYear);
    realmDefineFunction(realmC.Date_prototype, "setUTCFullYear", 3, Date_prototype_setUTCFullYear);
    realmDefineFunction(realmC.Date_prototype, "toUTCString", 0, Date_prototype_toUTCString);
    realmDefineFunction(realmC.Date_prototype, "toISOString", 0, Date_prototype_toISOString);
    realmDefineFunction(realmC.Date_prototype, "toJSON", 1, Date_prototype_toJSON);
    realmDefineFunction(realmC.Date_prototype, "getYear", 0, Date_prototype_getYear);
    realmDefineFunction(realmC.Date_prototype, "setYear", 1, Date_prototype_setYear);
    realmDefineFunction(realmC.Date_prototype, "toGMTString", 0, Date_prototype_toUTCString);

    realmDefineFinal(realmC.RegExp, "length", 2);
    realmDefineFinalRefRealm(realmC.RegExp, "prototype", "RegExp_prototype");
    realmDefineFinal(realmC.RegExp_prototype, "source", "(?:)");
    realmDefineFinal(realmC.RegExp_prototype, "global", false);
    realmDefineFinal(realmC.RegExp_prototype, "ignoreCase", false);
    realmDefineFinal(realmC.RegExp_prototype, "multiline", false);
    realmDefineWritable(realmC.RegExp_prototype, "lastIndex", 0);
    realmDefineRefRealm(realmC.RegExp_prototype, "constructor", "RegExp");
    realmDefineFunction(realmC.RegExp_prototype, "exec", 1, RegExp_prototype_exec);
    realmDefineFunction(realmC.RegExp_prototype, "test", 1, RegExp_prototype_test);
    realmDefineFunction(realmC.RegExp_prototype, "toString", 0, RegExp_prototype_toString);

    realmDefineFinal(realmC.Error, "length", 1);
    realmDefineFinalRefRealm(realmC.Error, "prototype", "Error_prototype");
    realmDefineRefRealm(realmC.Error_prototype, "constructor", "Error");
    realmDefine(realmC.Error_prototype, "name", "Error");
    realmDefine(realmC.Error_prototype, "message", "");
    realmDefineFunction(realmC.Error_prototype, "toString", 0, Error_prototype_toString);
    realmDefineWritable(realmC.Error, "stackTraceLimit", 10);
    realmDefineAccessor(realmC.Error_prototype, "stack", get_Error_prototype_stack, undefined);
    realmDefineFunction(realmC.Error_prototype, "getStackTraceEntry", 1, Error_prototype_getStackTraceEntry);

    realmDefineFinal(realmC.EvalError, "length", 1);
    realmDefineFinalRefRealm(realmC.EvalError, "prototype", "EvalError_prototype");
    realmDefineRefRealm(realmC.EvalError_prototype, "constructor", "EvalError");
    realmDefine(realmC.EvalError_prototype, "name", "EvalError");
    realmDefine(realmC.EvalError_prototype, "message", "");

    realmDefineFinal(realmC.RangeError, "length", 1);
    realmDefineFinalRefRealm(realmC.RangeError, "prototype", "RangeError_prototype");
    realmDefineRefRealm(realmC.RangeError_prototype, "constructor", "RangeError");
    realmDefine(realmC.RangeError_prototype, "name", "RangeError");
    realmDefine(realmC.RangeError_prototype, "message", "");

    realmDefineFinal(realmC.ReferenceError, "length", 1);
    realmDefineFinalRefRealm(realmC.ReferenceError, "prototype", "ReferenceError_prototype");
    realmDefineRefRealm(realmC.ReferenceError_prototype, "constructor", "ReferenceError");
    realmDefine(realmC.ReferenceError_prototype, "name", "ReferenceError");
    realmDefine(realmC.ReferenceError_prototype, "message", "");

    realmDefineFinal(realmC.SyntaxError, "length", 1);
    realmDefineFinalRefRealm(realmC.SyntaxError, "prototype", "SyntaxError_prototype");
    realmDefineRefRealm(realmC.SyntaxError_prototype, "constructor", "SyntaxError");
    realmDefine(realmC.SyntaxError_prototype, "name", "SyntaxError");
    realmDefine(realmC.SyntaxError_prototype, "message", "");

    realmDefineFinal(realmC.TypeError, "length", 1);
    realmDefineFinalRefRealm(realmC.TypeError, "prototype", "TypeError_prototype");
    realmDefineRefRealm(realmC.TypeError_prototype, "constructor", "TypeError");
    realmDefine(realmC.TypeError_prototype, "name", "TypeError");
    realmDefine(realmC.TypeError_prototype, "message", "");

    realmDefineFinal(realmC.URIError, "length", 1);
    realmDefineFinalRefRealm(realmC.URIError, "prototype", "URIError_prototype");
    realmDefineRefRealm(realmC.URIError_prototype, "constructor", "URIError");
    realmDefine(realmC.URIError_prototype, "name", "URIError");
    realmDefine(realmC.URIError_prototype, "message", "");

    realmDefineFunction(realmC.JSON, "parse", 2, JSON_parse);
    realmDefineFunction(realmC.JSON, "stringify", 3, JSON_stringify);

    realmDefineFinal(realmC.Object, "name", "Object");
    realmDefineFinal(realmC.Function, "name", "Function");
    realmDefineFinal(realmC.Array, "name", "Array");
    realmDefineFinal(realmC.String, "name", "String");
    realmDefineFinal(realmC.Boolean, "name", "Boolean");
    realmDefineFinal(realmC.Number, "name", "Number");
    realmDefineFinal(realmC.Date, "name", "Date");
    realmDefineFinal(realmC.RegExp, "name", "RegExp");
    realmDefineFinal(realmC.Error, "name", "Error");
    realmDefineFinal(realmC.EvalError, "name", "EvalError");
    realmDefineFinal(realmC.RangeError, "name", "RangeError");
    realmDefineFinal(realmC.ReferenceError, "name", "ReferenceError");
    realmDefineFinal(realmC.SyntaxError, "name", "SyntaxError");
    realmDefineFinal(realmC.TypeError, "name", "TypeError");
    realmDefineFinal(realmC.URIError, "name", "URIError");

    return realmC;
}

function initializeRealm(realmC) {
    realm = {};

    realm.Object_prototype = createRealmObject(realmC.Object_prototype);
    realm.Object_prototype.Prototype = null;

    realm.Function_prototype = createRealmObject(realmC.Function_prototype);
    realm.Function_prototype.Prototype = realm.Object_prototype;
    defineCall(realm.Function_prototype, ReturnUndefined);

    realm.Array_prototype = createRealmObject(realmC.Array_prototype);
    realm.Array_prototype.Prototype = realm.Object_prototype;

    realm.String_prototype = createRealmObject(realmC.String_prototype);
    realm.String_prototype.Prototype = realm.Object_prototype;
    realm.String_prototype.PrimitiveValue = "";

    realm.Boolean_prototype = createRealmObject(realmC.Boolean_prototype);
    realm.Boolean_prototype.Prototype = realm.Object_prototype;
    realm.Boolean_prototype.PrimitiveValue = false;

    realm.Number_prototype = createRealmObject(realmC.Number_prototype);
    realm.Number_prototype.Prototype = realm.Object_prototype;
    realm.Number_prototype.PrimitiveValue = 0;

    realm.Date_prototype = createRealmObject(realmC.Date_prototype);
    realm.Date_prototype.Prototype = realm.Object_prototype;
    realm.Date_prototype.PrimitiveValue = NaN;

    realm.RegExp_prototype = createRealmObject(realmC.RegExp_prototype);
    realm.RegExp_prototype.Prototype = realm.Object_prototype;

    realm.Error_prototype = createRealmObject(realmC.Error_prototype);
    realm.Error_prototype.Prototype = realm.Object_prototype;

    realm.EvalError_prototype = createRealmObject(realmC.EvalError_prototype);
    realm.EvalError_prototype.Prototype = realm.Error_prototype;

    realm.RangeError_prototype = createRealmObject(realmC.RangeError_prototype);
    realm.RangeError_prototype.Prototype = realm.Error_prototype;

    realm.ReferenceError_prototype = createRealmObject(realmC.ReferenceError_prototype);
    realm.ReferenceError_prototype.Prototype = realm.Error_prototype;

    realm.SyntaxError_prototype = createRealmObject(realmC.SyntaxError_prototype);
    realm.SyntaxError_prototype.Prototype = realm.Error_prototype;

    realm.TypeError_prototype = createRealmObject(realmC.TypeError_prototype);
    realm.TypeError_prototype.Prototype = realm.Error_prototype;

    realm.URIError_prototype = createRealmObject(realmC.URIError_prototype);
    realm.URIError_prototype.Prototype = realm.Error_prototype;

    realm.Object = createRealmObject(realmC.Object);
    defineCall(realm.Object, Object_Call);
    defineConstruct(realm.Object, Object_Construct);
    realm.Object.Prototype = realm.Function_prototype;

    realm.Function = createRealmObject(realmC.Function);
    defineCall(realm.Function, Function_Call);
    defineConstruct(realm.Function, Function_Construct);
    realm.Function.Prototype = realm.Function_prototype;

    realm.Array = createRealmObject(realmC.Array);
    defineCall(realm.Array, Array_Call);
    defineConstruct(realm.Array, Array_Construct);
    realm.Array.Prototype = realm.Function_prototype;

    realm.String = createRealmObject(realmC.String);
    defineCall(realm.String, String_Call);
    defineConstruct(realm.String, String_Construct);
    realm.String.Prototype = realm.Function_prototype;

    realm.Boolean = createRealmObject(realmC.Boolean);
    defineCall(realm.Boolean, Boolean_Call);
    defineConstruct(realm.Boolean, Boolean_Construct);
    realm.Boolean.Prototype = realm.Function_prototype;

    realm.Number = createRealmObject(realmC.Number);
    defineCall(realm.Number, Number_Call);
    defineConstruct(realm.Number, Number_Construct);
    realm.Number.Prototype = realm.Function_prototype;

    realm.Math = createRealmObject(realmC.Math);
    realm.Math.Prototype = realm.Object_prototype;

    realm.Date = createRealmObject(realmC.Date);
    defineCall(realm.Date, Date_Call);
    defineConstruct(realm.Date, Date_Construct);
    realm.Date.Prototype = realm.Function_prototype;

    realm.RegExp = createRealmObject(realmC.RegExp);
    defineCall(realm.RegExp, RegExp_Call);
    defineConstruct(realm.RegExp, RegExp_Construct);
    realm.RegExp.Prototype = realm.Function_prototype;

    realm.Error = createRealmObject(realmC.Error);
    defineCall(realm.Error, Error_Call);
    defineConstruct(realm.Error, Error_Construct);
    realm.Error.Prototype = realm.Function_prototype;

    realm.EvalError = createRealmObject(realmC.EvalError);
    defineCall(realm.EvalError, EvalError_Call);
    defineConstruct(realm.EvalError, EvalError_Construct);
    realm.EvalError.Prototype = realm.Function_prototype;

    realm.RangeError = createRealmObject(realmC.RangeError);
    defineCall(realm.RangeError, RangeError_Call);
    defineConstruct(realm.RangeError, RangeError_Construct);
    realm.RangeError.Prototype = realm.Function_prototype;

    realm.ReferenceError = createRealmObject(realmC.ReferenceError);
    defineCall(realm.ReferenceError, ReferenceError_Call);
    defineConstruct(realm.ReferenceError, ReferenceError_Construct);
    realm.ReferenceError.Prototype = realm.Function_prototype;

    realm.SyntaxError = createRealmObject(realmC.SyntaxError);
    defineCall(realm.SyntaxError, SyntaxError_Call);
    defineConstruct(realm.SyntaxError, SyntaxError_Construct);
    realm.SyntaxError.Prototype = realm.Function_prototype;

    realm.TypeError = createRealmObject(realmC.TypeError);
    defineCall(realm.TypeError, TypeError_Call);
    defineConstruct(realm.TypeError, TypeError_Construct);
    realm.TypeError.Prototype = realm.Function_prototype;

    realm.URIError = createRealmObject(realmC.URIError);
    defineCall(realm.URIError, URIError_Call);
    defineConstruct(realm.URIError, URIError_Construct);
    realm.URIError.Prototype = realm.Function_prototype;

    realm.JSON = createRealmObject(realmC.JSON);
    realm.JSON.Prototype = realm.Object_prototype;

    realm.theGlobalObject = createRealmObject(realmC.theGlobalObject);
    realm.theGlobalObject.Prototype = realm.Object_prototype;

    realm.theGlobalEnvironment = NewObjectEnvironment(realm.theGlobalObject, null);
    realm.theThrowTypeError = createThrowTypeErrorObject();
    realm.theEvalFunction = intrinsic_get(realm.theGlobalObject, "eval");
    RegExpFactory.recompile(realm.RegExp_prototype);
}
