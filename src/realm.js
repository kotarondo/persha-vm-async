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

function RealmObjectClass(Class) {
    var predefined = Object.create(null);
    var realmC = { Class, predefined };
    return realmC;
}

function createRealmObject(realmC) {
    var { Class, predefined } = realmC;
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
    var obj = Object.create(Class);
    obj.properties = new Proxy(target, proxyHandler);
    obj.Prototype = null;
    obj.Extensible = true;
    obj.numProps = 0;
    return obj;
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

function realmClassDefine(realmClass, name, creator) {
    Object.defineProperty(realmClass, name, { get: getf, enumerable: false, configurable: true });

    function getf() {
        var v = creator();
        assert(this !== realmClass);
        Object.defineProperty(this, name, { value: v, writable: false, enumerable: false, configurable: true });
        return v;
    }
}

function initializeRealmClass() {
    var realmC_Object_prototype = RealmObjectClass(Class_Object);
    var realmC_Function_prototype = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Array_prototype = RealmObjectClass(Class_Array);
    var realmC_String_prototype = RealmObjectClass(Class_String);
    var realmC_Boolean_prototype = RealmObjectClass(Class_Boolean);
    var realmC_Number_prototype = RealmObjectClass(Class_Number);
    var realmC_Date_prototype = RealmObjectClass(Class_Date);
    var realmC_RegExp_prototype = RealmObjectClass(Class_RegExp);
    var realmC_Error_prototype = RealmObjectClass(Class_Error);
    var realmC_EvalError_prototype = RealmObjectClass(Class_Error);
    var realmC_RangeError_prototype = RealmObjectClass(Class_Error);
    var realmC_ReferenceError_prototype = RealmObjectClass(Class_Error);
    var realmC_SyntaxError_prototype = RealmObjectClass(Class_Error);
    var realmC_TypeError_prototype = RealmObjectClass(Class_Error);
    var realmC_URIError_prototype = RealmObjectClass(Class_Error);
    var realmC_Object = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Function = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Array = RealmObjectClass(Class_BuiltinFunction);
    var realmC_String = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Boolean = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Number = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Math = RealmObjectClass(Class_Math);
    var realmC_Date = RealmObjectClass(Class_BuiltinFunction);
    var realmC_RegExp = RealmObjectClass(Class_BuiltinFunction);
    var realmC_Error = RealmObjectClass(Class_BuiltinFunction);
    var realmC_EvalError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_RangeError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_ReferenceError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_SyntaxError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_TypeError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_URIError = RealmObjectClass(Class_BuiltinFunction);
    var realmC_JSON = RealmObjectClass(Class_JSON);
    var realmC_theGlobalObject = RealmObjectClass(Class_Global);

    realmDefineFinal(realmC_theGlobalObject, "NaN", NaN);
    realmDefineFinal(realmC_theGlobalObject, "Infinity", Infinity);
    realmDefineFinal(realmC_theGlobalObject, "undefined", undefined);
    realmDefineFunction(realmC_theGlobalObject, "eval", 1, Global_eval);
    realmDefineFunction(realmC_theGlobalObject, "parseInt", 2, Global_parseInt);
    realmDefineFunction(realmC_theGlobalObject, "parseFloat", 1, Global_parseFloat);
    realmDefineFunction(realmC_theGlobalObject, "isNaN", 1, Global_isNaN);
    realmDefineFunction(realmC_theGlobalObject, "isFinite", 1, Global_isFinite);
    realmDefineFunction(realmC_theGlobalObject, "decodeURI", 1, Global_decodeURI);
    realmDefineFunction(realmC_theGlobalObject, "decodeURIComponent", 1, Global_decodeURIComponent);
    realmDefineFunction(realmC_theGlobalObject, "encodeURI", 1, Global_encodeURI);
    realmDefineFunction(realmC_theGlobalObject, "encodeURIComponent", 1, Global_encodeURIComponent);
    realmDefineFunction(realmC_theGlobalObject, "escape", 1, Global_escape);
    realmDefineFunction(realmC_theGlobalObject, "unescape", 1, Global_unescape);
    realmDefineRefRealm(realmC_theGlobalObject, "Object", "Object");
    realmDefineRefRealm(realmC_theGlobalObject, "Function", "Function");
    realmDefineRefRealm(realmC_theGlobalObject, "Array", "Array");
    realmDefineRefRealm(realmC_theGlobalObject, "String", "String");
    realmDefineRefRealm(realmC_theGlobalObject, "Boolean", "Boolean");
    realmDefineRefRealm(realmC_theGlobalObject, "Number", "Number");
    realmDefineRefRealm(realmC_theGlobalObject, "Math", "Math");
    realmDefineRefRealm(realmC_theGlobalObject, "Date", "Date");
    realmDefineRefRealm(realmC_theGlobalObject, "RegExp", "RegExp");
    realmDefineRefRealm(realmC_theGlobalObject, "Error", "Error");
    realmDefineRefRealm(realmC_theGlobalObject, "EvalError", "EvalError");
    realmDefineRefRealm(realmC_theGlobalObject, "RangeError", "RangeError");
    realmDefineRefRealm(realmC_theGlobalObject, "ReferenceError", "ReferenceError");
    realmDefineRefRealm(realmC_theGlobalObject, "SyntaxError", "SyntaxError");
    realmDefineRefRealm(realmC_theGlobalObject, "TypeError", "TypeError");
    realmDefineRefRealm(realmC_theGlobalObject, "URIError", "URIError");
    realmDefineRefRealm(realmC_theGlobalObject, "JSON", "JSON");

    realmDefineFinal(realmC_Object, "length", 1);
    realmDefineFinalRefRealm(realmC_Object, "prototype", "Object_prototype");
    realmDefineFunction(realmC_Object, "getPrototypeOf", 1, Object_getPrototypeOf);
    realmDefineFunction(realmC_Object, "getOwnPropertyDescriptor", 2, Object_getOwnPropertyDescriptor);
    realmDefineFunction(realmC_Object, "getOwnPropertyNames", 1, Object_getOwnPropertyNames);
    realmDefineFunction(realmC_Object, "create", 2, Object_create);
    realmDefineFunction(realmC_Object, "defineProperty", 3, Object_defineProperty);
    realmDefineFunction(realmC_Object, "defineProperties", 2, Object_defineProperties);
    realmDefineFunction(realmC_Object, "seal", 1, Object_seal);
    realmDefineFunction(realmC_Object, "freeze", 1, Object_freeze);
    realmDefineFunction(realmC_Object, "preventExtensions", 1, Object_preventExtensions);
    realmDefineFunction(realmC_Object, "isSealed", 1, Object_isSealed);
    realmDefineFunction(realmC_Object, "isFrozen", 1, Object_isFrozen);
    realmDefineFunction(realmC_Object, "isExtensible", 1, Object_isExtensible);
    realmDefineFunction(realmC_Object, "keys", 1, Object_keys);
    realmDefineRefRealm(realmC_Object_prototype, "constructor", "Object");
    realmDefineFunction(realmC_Object_prototype, "toString", 0, Object_prototype_toString);
    realmDefineFunction(realmC_Object_prototype, "toLocaleString", 0, Object_prototype_toLocaleString);
    realmDefineFunction(realmC_Object_prototype, "valueOf", 0, Object_prototype_valueOf);
    realmDefineFunction(realmC_Object_prototype, "hasOwnProperty", 1, Object_prototype_hasOwnProperty);
    realmDefineFunction(realmC_Object_prototype, "isPrototypeOf", 1, Object_prototype_isPrototypeOf);
    realmDefineFunction(realmC_Object_prototype, "propertyIsEnumerable", 1, Object_prototype_propertyIsEnumerable);
    realmDefineAccessor(realmC_Object_prototype, "__proto__", get_Object_prototype___proto__, set_Object_prototype___proto__);

    realmDefineFinal(realmC_Function, "length", 1);
    realmDefineFinalRefRealm(realmC_Function, "prototype", "Function_prototype");
    realmDefineFinal(realmC_Function_prototype, "length", 0);
    realmDefineRefRealm(realmC_Function_prototype, "constructor", "Function");
    realmDefineFunction(realmC_Function_prototype, "toString", 0, Function_prototype_toString);
    realmDefineFunction(realmC_Function_prototype, "apply", 2, Function_prototype_apply);
    realmDefineFunction(realmC_Function_prototype, "call", 1, Function_prototype_call);
    realmDefineFunction(realmC_Function_prototype, "bind", 1, Function_prototype_bind);
    realmDefineAccessor(realmC_Function_prototype, "name", get_Function_prototype_name, undefined);

    realmDefineFinal(realmC_Array, "length", 1);
    realmDefineFinalRefRealm(realmC_Array, "prototype", "Array_prototype");
    realmDefineFunction(realmC_Array, "isArray", 1, Array_isArray);
    realmDefineWritable(realmC_Array_prototype, "length", 0);
    realmDefineRefRealm(realmC_Array_prototype, "constructor", "Array");
    realmDefineFunction(realmC_Array_prototype, "toString", 0, Array_prototype_toString);
    realmDefineFunction(realmC_Array_prototype, "toLocaleString", 0, Array_prototype_toLocaleString);
    realmDefineFunction(realmC_Array_prototype, "concat", 1, Array_prototype_concat);
    realmDefineFunction(realmC_Array_prototype, "join", 1, Array_prototype_join);
    realmDefineFunction(realmC_Array_prototype, "pop", 0, Array_prototype_pop);
    realmDefineFunction(realmC_Array_prototype, "push", 1, Array_prototype_push);
    realmDefineFunction(realmC_Array_prototype, "reverse", 0, Array_prototype_reverse);
    realmDefineFunction(realmC_Array_prototype, "shift", 0, Array_prototype_shift);
    realmDefineFunction(realmC_Array_prototype, "slice", 2, Array_prototype_slice);
    realmDefineFunction(realmC_Array_prototype, "sort", 1, Array_prototype_sort);
    realmDefineFunction(realmC_Array_prototype, "splice", 2, Array_prototype_splice);
    realmDefineFunction(realmC_Array_prototype, "unshift", 1, Array_prototype_unshift);
    realmDefineFunction(realmC_Array_prototype, "indexOf", 1, Array_prototype_indexOf);
    realmDefineFunction(realmC_Array_prototype, "lastIndexOf", 1, Array_prototype_lastIndexOf);
    realmDefineFunction(realmC_Array_prototype, "every", 1, Array_prototype_every);
    realmDefineFunction(realmC_Array_prototype, "some", 1, Array_prototype_some);
    realmDefineFunction(realmC_Array_prototype, "forEach", 1, Array_prototype_forEach);
    realmDefineFunction(realmC_Array_prototype, "map", 1, Array_prototype_map);
    realmDefineFunction(realmC_Array_prototype, "filter", 1, Array_prototype_filter);
    realmDefineFunction(realmC_Array_prototype, "reduce", 1, Array_prototype_reduce);
    realmDefineFunction(realmC_Array_prototype, "reduceRight", 1, Array_prototype_reduceRight);

    realmDefineFinal(realmC_String, "length", 1);
    realmDefineFinalRefRealm(realmC_String, "prototype", "String_prototype");
    realmDefineFunction(realmC_String, "fromCharCode", 1, String_fromCharCode);
    realmDefineFinal(realmC_String_prototype, "length", 0);
    realmDefineRefRealm(realmC_String_prototype, "constructor", "String");
    realmDefineFunction(realmC_String_prototype, "toString", 0, String_prototype_toString);
    realmDefineFunction(realmC_String_prototype, "valueOf", 0, String_prototype_valueOf);
    realmDefineFunction(realmC_String_prototype, "charAt", 1, String_prototype_charAt);
    realmDefineFunction(realmC_String_prototype, "charCodeAt", 1, String_prototype_charCodeAt);
    realmDefineFunction(realmC_String_prototype, "concat", 1, String_prototype_concat);
    realmDefineFunction(realmC_String_prototype, "indexOf", 1, String_prototype_indexOf);
    realmDefineFunction(realmC_String_prototype, "lastIndexOf", 1, String_prototype_lastIndexOf);
    realmDefineFunction(realmC_String_prototype, "localeCompare", 1, String_prototype_localeCompare);
    realmDefineFunction(realmC_String_prototype, "match", 1, String_prototype_match);
    realmDefineFunction(realmC_String_prototype, "replace", 2, String_prototype_replace);
    realmDefineFunction(realmC_String_prototype, "search", 1, String_prototype_search);
    realmDefineFunction(realmC_String_prototype, "slice", 2, String_prototype_slice);
    realmDefineFunction(realmC_String_prototype, "split", 2, String_prototype_split);
    realmDefineFunction(realmC_String_prototype, "substring", 2, String_prototype_substring);
    realmDefineFunction(realmC_String_prototype, "toLowerCase", 0, String_prototype_toLowerCase);
    realmDefineFunction(realmC_String_prototype, "toLocaleLowerCase", 0, String_prototype_toLocaleLowerCase);
    realmDefineFunction(realmC_String_prototype, "toUpperCase", 0, String_prototype_toUpperCase);
    realmDefineFunction(realmC_String_prototype, "toLocaleUpperCase", 0, String_prototype_toLocaleUpperCase);
    realmDefineFunction(realmC_String_prototype, "trim", 0, String_prototype_trim);
    realmDefineFunction(realmC_String_prototype, "substr", 2, String_prototype_substr);

    realmDefineFinal(realmC_Boolean, "length", 1);
    realmDefineFinalRefRealm(realmC_Boolean, "prototype", "Boolean_prototype");
    realmDefineRefRealm(realmC_Boolean_prototype, "constructor", "Boolean");
    realmDefineFunction(realmC_Boolean_prototype, "toString", 0, Boolean_prototype_toString);
    realmDefineFunction(realmC_Boolean_prototype, "valueOf", 0, Boolean_prototype_valueOf);

    realmDefineFinal(realmC_Number, "length", 1);
    realmDefineFinalRefRealm(realmC_Number, "prototype", "Number_prototype");
    realmDefineFinal(realmC_Number, "MAX_VALUE", Number.MAX_VALUE);
    realmDefineFinal(realmC_Number, "MIN_VALUE", Number.MIN_VALUE);
    realmDefineFinal(realmC_Number, "NaN", NaN);
    realmDefineFinal(realmC_Number, "POSITIVE_INFINITY", Infinity);
    realmDefineFinal(realmC_Number, "NEGATIVE_INFINITY", -Infinity);
    realmDefineRefRealm(realmC_Number_prototype, "constructor", "Number");
    realmDefineFunction(realmC_Number_prototype, "toString", 0, Number_prototype_toString);
    realmDefineFunction(realmC_Number_prototype, "toLocaleString", 0, Number_prototype_toLocaleString);
    realmDefineFunction(realmC_Number_prototype, "valueOf", 0, Number_prototype_valueOf);
    realmDefineFunction(realmC_Number_prototype, "toFixed", 1, Number_prototype_toFixed);
    realmDefineFunction(realmC_Number_prototype, "toExponential", 1, Number_prototype_toExponential);
    realmDefineFunction(realmC_Number_prototype, "toPrecision", 1, Number_prototype_toPrecision);

    realmDefineFinal(realmC_Math, "E", Math.E);
    realmDefineFinal(realmC_Math, "LN10", Math.LN10);
    realmDefineFinal(realmC_Math, "LN2", Math.LN2);
    realmDefineFinal(realmC_Math, "LOG2E", Math.LOG2E);
    realmDefineFinal(realmC_Math, "LOG10E", Math.LOG10E);
    realmDefineFinal(realmC_Math, "PI", Math.PI);
    realmDefineFinal(realmC_Math, "SQRT1_2", Math.SQRT1_2);
    realmDefineFinal(realmC_Math, "SQRT2", Math.SQRT2);
    realmDefineFunction(realmC_Math, "abs", 1, Math_abs);
    realmDefineFunction(realmC_Math, "acos", 1, Math_acos);
    realmDefineFunction(realmC_Math, "asin", 1, Math_asin);
    realmDefineFunction(realmC_Math, "atan", 1, Math_atan);
    realmDefineFunction(realmC_Math, "atan2", 2, Math_atan2);
    realmDefineFunction(realmC_Math, "ceil", 1, Math_ceil);
    realmDefineFunction(realmC_Math, "cos", 1, Math_cos);
    realmDefineFunction(realmC_Math, "exp", 1, Math_exp);
    realmDefineFunction(realmC_Math, "floor", 1, Math_floor);
    realmDefineFunction(realmC_Math, "log", 1, Math_log);
    realmDefineFunction(realmC_Math, "max", 2, Math_max);
    realmDefineFunction(realmC_Math, "min", 2, Math_min);
    realmDefineFunction(realmC_Math, "pow", 2, Math_pow);
    realmDefineFunction(realmC_Math, "random", 0, Math_random);
    realmDefineFunction(realmC_Math, "round", 1, Math_round);
    realmDefineFunction(realmC_Math, "sin", 1, Math_sin);
    realmDefineFunction(realmC_Math, "sqrt", 1, Math_sqrt);
    realmDefineFunction(realmC_Math, "tan", 1, Math_tan);

    realmDefineFinal(realmC_Date, "length", 7);
    realmDefineFinalRefRealm(realmC_Date, "prototype", "Date_prototype");
    realmDefineFunction(realmC_Date, "parse", 1, Date_parse);
    realmDefineFunction(realmC_Date, "UTC", 7, Date_UTC);
    realmDefineFunction(realmC_Date, "now", 0, Date_now);
    realmDefineRefRealm(realmC_Date_prototype, "constructor", "Date");
    realmDefineFunction(realmC_Date_prototype, "toString", 0, Date_prototype_toString);
    realmDefineFunction(realmC_Date_prototype, "toDateString", 0, Date_prototype_toDateString);
    realmDefineFunction(realmC_Date_prototype, "toTimeString", 0, Date_prototype_toTimeString);
    realmDefineFunction(realmC_Date_prototype, "toLocaleString", 0, Date_prototype_toLocaleString);
    realmDefineFunction(realmC_Date_prototype, "toLocaleDateString", 0, Date_prototype_toLocaleDateString);
    realmDefineFunction(realmC_Date_prototype, "toLocaleTimeString", 0, Date_prototype_toLocaleTimeString);
    realmDefineFunction(realmC_Date_prototype, "valueOf", 0, Date_prototype_valueOf);
    realmDefineFunction(realmC_Date_prototype, "getTime", 0, Date_prototype_getTime);
    realmDefineFunction(realmC_Date_prototype, "getFullYear", 0, Date_prototype_getFullYear);
    realmDefineFunction(realmC_Date_prototype, "getUTCFullYear", 0, Date_prototype_getUTCFullYear);
    realmDefineFunction(realmC_Date_prototype, "getMonth", 0, Date_prototype_getMonth);
    realmDefineFunction(realmC_Date_prototype, "getUTCMonth", 0, Date_prototype_getUTCMonth);
    realmDefineFunction(realmC_Date_prototype, "getDate", 0, Date_prototype_getDate);
    realmDefineFunction(realmC_Date_prototype, "getUTCDate", 0, Date_prototype_getUTCDate);
    realmDefineFunction(realmC_Date_prototype, "getDay", 0, Date_prototype_getDay);
    realmDefineFunction(realmC_Date_prototype, "getUTCDay", 0, Date_prototype_getUTCDay);
    realmDefineFunction(realmC_Date_prototype, "getHours", 0, Date_prototype_getHours);
    realmDefineFunction(realmC_Date_prototype, "getUTCHours", 0, Date_prototype_getUTCHours);
    realmDefineFunction(realmC_Date_prototype, "getMinutes", 0, Date_prototype_getMinutes);
    realmDefineFunction(realmC_Date_prototype, "getUTCMinutes", 0, Date_prototype_getUTCMinutes);
    realmDefineFunction(realmC_Date_prototype, "getSeconds", 0, Date_prototype_getSeconds);
    realmDefineFunction(realmC_Date_prototype, "getUTCSeconds", 0, Date_prototype_getUTCSeconds);
    realmDefineFunction(realmC_Date_prototype, "getMilliseconds", 0, Date_prototype_getMilliseconds);
    realmDefineFunction(realmC_Date_prototype, "getUTCMilliseconds", 0, Date_prototype_getUTCMilliseconds);
    realmDefineFunction(realmC_Date_prototype, "getTimezoneOffset", 0, Date_prototype_getTimezoneOffset);
    realmDefineFunction(realmC_Date_prototype, "setTime", 1, Date_prototype_setTime);
    realmDefineFunction(realmC_Date_prototype, "setMilliseconds", 1, Date_prototype_setMilliseconds);
    realmDefineFunction(realmC_Date_prototype, "setUTCMilliseconds", 1, Date_prototype_setUTCMilliseconds);
    realmDefineFunction(realmC_Date_prototype, "setSeconds", 2, Date_prototype_setSeconds);
    realmDefineFunction(realmC_Date_prototype, "setUTCSeconds", 2, Date_prototype_setUTCSeconds);
    realmDefineFunction(realmC_Date_prototype, "setMinutes", 3, Date_prototype_setMinutes);
    realmDefineFunction(realmC_Date_prototype, "setUTCMinutes", 3, Date_prototype_setUTCMinutes);
    realmDefineFunction(realmC_Date_prototype, "setHours", 4, Date_prototype_setHours);
    realmDefineFunction(realmC_Date_prototype, "setUTCHours", 4, Date_prototype_setUTCHours);
    realmDefineFunction(realmC_Date_prototype, "setDate", 1, Date_prototype_setDate);
    realmDefineFunction(realmC_Date_prototype, "setUTCDate", 1, Date_prototype_setUTCDate);
    realmDefineFunction(realmC_Date_prototype, "setMonth", 2, Date_prototype_setMonth);
    realmDefineFunction(realmC_Date_prototype, "setUTCMonth", 2, Date_prototype_setUTCMonth);
    realmDefineFunction(realmC_Date_prototype, "setFullYear", 3, Date_prototype_setFullYear);
    realmDefineFunction(realmC_Date_prototype, "setUTCFullYear", 3, Date_prototype_setUTCFullYear);
    realmDefineFunction(realmC_Date_prototype, "toUTCString", 0, Date_prototype_toUTCString);
    realmDefineFunction(realmC_Date_prototype, "toISOString", 0, Date_prototype_toISOString);
    realmDefineFunction(realmC_Date_prototype, "toJSON", 1, Date_prototype_toJSON);
    realmDefineFunction(realmC_Date_prototype, "getYear", 0, Date_prototype_getYear);
    realmDefineFunction(realmC_Date_prototype, "setYear", 1, Date_prototype_setYear);
    realmDefineFunction(realmC_Date_prototype, "toGMTString", 0, Date_prototype_toUTCString);

    realmDefineFinal(realmC_RegExp, "length", 2);
    realmDefineFinalRefRealm(realmC_RegExp, "prototype", "RegExp_prototype");
    realmDefineFinal(realmC_RegExp_prototype, "source", "(?:)");
    realmDefineFinal(realmC_RegExp_prototype, "global", false);
    realmDefineFinal(realmC_RegExp_prototype, "ignoreCase", false);
    realmDefineFinal(realmC_RegExp_prototype, "multiline", false);
    realmDefineWritable(realmC_RegExp_prototype, "lastIndex", 0);
    realmDefineRefRealm(realmC_RegExp_prototype, "constructor", "RegExp");
    realmDefineFunction(realmC_RegExp_prototype, "exec", 1, RegExp_prototype_exec);
    realmDefineFunction(realmC_RegExp_prototype, "test", 1, RegExp_prototype_test);
    realmDefineFunction(realmC_RegExp_prototype, "toString", 0, RegExp_prototype_toString);

    realmDefineFinal(realmC_Error, "length", 1);
    realmDefineFinalRefRealm(realmC_Error, "prototype", "Error_prototype");
    realmDefineRefRealm(realmC_Error_prototype, "constructor", "Error");
    realmDefine(realmC_Error_prototype, "name", "Error");
    realmDefine(realmC_Error_prototype, "message", "");
    realmDefineFunction(realmC_Error_prototype, "toString", 0, Error_prototype_toString);
    realmDefineWritable(realmC_Error, "stackTraceLimit", 10);
    realmDefineAccessor(realmC_Error_prototype, "stack", get_Error_prototype_stack, undefined);
    realmDefineFunction(realmC_Error_prototype, "getStackTraceEntry", 1, Error_prototype_getStackTraceEntry);

    realmDefineFinal(realmC_EvalError, "length", 1);
    realmDefineFinalRefRealm(realmC_EvalError, "prototype", "EvalError_prototype");
    realmDefineRefRealm(realmC_EvalError_prototype, "constructor", "EvalError");
    realmDefine(realmC_EvalError_prototype, "name", "EvalError");
    realmDefine(realmC_EvalError_prototype, "message", "");

    realmDefineFinal(realmC_RangeError, "length", 1);
    realmDefineFinalRefRealm(realmC_RangeError, "prototype", "RangeError_prototype");
    realmDefineRefRealm(realmC_RangeError_prototype, "constructor", "RangeError");
    realmDefine(realmC_RangeError_prototype, "name", "RangeError");
    realmDefine(realmC_RangeError_prototype, "message", "");

    realmDefineFinal(realmC_ReferenceError, "length", 1);
    realmDefineFinalRefRealm(realmC_ReferenceError, "prototype", "ReferenceError_prototype");
    realmDefineRefRealm(realmC_ReferenceError_prototype, "constructor", "ReferenceError");
    realmDefine(realmC_ReferenceError_prototype, "name", "ReferenceError");
    realmDefine(realmC_ReferenceError_prototype, "message", "");

    realmDefineFinal(realmC_SyntaxError, "length", 1);
    realmDefineFinalRefRealm(realmC_SyntaxError, "prototype", "SyntaxError_prototype");
    realmDefineRefRealm(realmC_SyntaxError_prototype, "constructor", "SyntaxError");
    realmDefine(realmC_SyntaxError_prototype, "name", "SyntaxError");
    realmDefine(realmC_SyntaxError_prototype, "message", "");

    realmDefineFinal(realmC_TypeError, "length", 1);
    realmDefineFinalRefRealm(realmC_TypeError, "prototype", "TypeError_prototype");
    realmDefineRefRealm(realmC_TypeError_prototype, "constructor", "TypeError");
    realmDefine(realmC_TypeError_prototype, "name", "TypeError");
    realmDefine(realmC_TypeError_prototype, "message", "");

    realmDefineFinal(realmC_URIError, "length", 1);
    realmDefineFinalRefRealm(realmC_URIError, "prototype", "URIError_prototype");
    realmDefineRefRealm(realmC_URIError_prototype, "constructor", "URIError");
    realmDefine(realmC_URIError_prototype, "name", "URIError");
    realmDefine(realmC_URIError_prototype, "message", "");

    realmDefineFunction(realmC_JSON, "parse", 2, JSON_parse);
    realmDefineFunction(realmC_JSON, "stringify", 3, JSON_stringify);

    realmDefineFinal(realmC_Object, "name", "Object");
    realmDefineFinal(realmC_Function, "name", "Function");
    realmDefineFinal(realmC_Array, "name", "Array");
    realmDefineFinal(realmC_String, "name", "String");
    realmDefineFinal(realmC_Boolean, "name", "Boolean");
    realmDefineFinal(realmC_Number, "name", "Number");
    realmDefineFinal(realmC_Date, "name", "Date");
    realmDefineFinal(realmC_RegExp, "name", "RegExp");
    realmDefineFinal(realmC_Error, "name", "Error");
    realmDefineFinal(realmC_EvalError, "name", "EvalError");
    realmDefineFinal(realmC_RangeError, "name", "RangeError");
    realmDefineFinal(realmC_ReferenceError, "name", "ReferenceError");
    realmDefineFinal(realmC_SyntaxError, "name", "SyntaxError");
    realmDefineFinal(realmC_TypeError, "name", "TypeError");
    realmDefineFinal(realmC_URIError, "name", "URIError");

    var realmClass = {};
    realmClassDefine(realmClass, 'Object_prototype', function() {
        var obj = createRealmObject(realmC_Object_prototype);
        obj.Prototype = null;
        return obj;
    });
    realmClassDefine(realmClass, 'Function_prototype', function() {
        var obj = createRealmObject(realmC_Function_prototype);
        obj.Prototype = realm.Object_prototype;
        defineCall(obj, ReturnUndefined);
        return obj;
    });
    realmClassDefine(realmClass, 'Array_prototype', function() {
        var obj = createRealmObject(realmC_Array_prototype);
        obj.Prototype = realm.Object_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'String_prototype', function() {
        var obj = createRealmObject(realmC_String_prototype);
        obj.Prototype = realm.Object_prototype;
        obj.PrimitiveValue = "";
        return obj;
    });
    realmClassDefine(realmClass, 'Boolean_prototype', function() {
        var obj = createRealmObject(realmC_Boolean_prototype);
        obj.Prototype = realm.Object_prototype;
        obj.PrimitiveValue = false;
        return obj;
    });
    realmClassDefine(realmClass, 'Number_prototype', function() {
        var obj = createRealmObject(realmC_Number_prototype);
        obj.Prototype = realm.Object_prototype;
        obj.PrimitiveValue = 0;
        return obj;
    });
    realmClassDefine(realmClass, 'Date_prototype', function() {
        var obj = createRealmObject(realmC_Date_prototype);
        obj.Prototype = realm.Object_prototype;
        obj.PrimitiveValue = NaN;
        return obj;
    });
    realmClassDefine(realmClass, 'RegExp_prototype', function() {
        var obj = createRealmObject(realmC_RegExp_prototype);
        obj.Prototype = realm.Object_prototype;
        RegExpFactory.recompile(obj);
        return obj;
    });
    realmClassDefine(realmClass, 'Error_prototype', function() {
        var obj = createRealmObject(realmC_Error_prototype);
        obj.Prototype = realm.Object_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'EvalError_prototype', function() {
        var obj = createRealmObject(realmC_EvalError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'RangeError_prototype', function() {
        var obj = createRealmObject(realmC_RangeError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'ReferenceError_prototype', function() {
        var obj = createRealmObject(realmC_ReferenceError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'SyntaxError_prototype', function() {
        var obj = createRealmObject(realmC_SyntaxError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'TypeError_prototype', function() {
        var obj = createRealmObject(realmC_TypeError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'URIError_prototype', function() {
        var obj = createRealmObject(realmC_URIError_prototype);
        obj.Prototype = realm.Error_prototype;
        return obj;
    });

    realmClassDefine(realmClass, 'Object', function() {
        var obj = createRealmObject(realmC_Object);
        defineCall(obj, Object_Call);
        defineConstruct(obj, Object_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Function', function() {
        var obj = createRealmObject(realmC_Function);
        defineCall(obj, Function_Call);
        defineConstruct(obj, Function_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Array', function() {
        var obj = createRealmObject(realmC_Array);
        defineCall(obj, Array_Call);
        defineConstruct(obj, Array_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'String', function() {
        var obj = createRealmObject(realmC_String);
        defineCall(obj, String_Call);
        defineConstruct(obj, String_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Boolean', function() {
        var obj = createRealmObject(realmC_Boolean);
        defineCall(obj, Boolean_Call);
        defineConstruct(obj, Boolean_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Number', function() {
        var obj = createRealmObject(realmC_Number);
        defineCall(obj, Number_Call);
        defineConstruct(obj, Number_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Math', function() {
        var obj = createRealmObject(realmC_Math);
        obj.Prototype = realm.Object_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Date', function() {
        var obj = createRealmObject(realmC_Date);
        defineCall(obj, Date_Call);
        defineConstruct(obj, Date_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'RegExp', function() {
        var obj = createRealmObject(realmC_RegExp);
        defineCall(obj, RegExp_Call);
        defineConstruct(obj, RegExp_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'Error', function() {
        var obj = createRealmObject(realmC_Error);
        defineCall(obj, Error_Call);
        defineConstruct(obj, Error_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'EvalError', function() {
        var obj = createRealmObject(realmC_EvalError);
        defineCall(obj, EvalError_Call);
        defineConstruct(obj, EvalError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'RangeError', function() {
        var obj = createRealmObject(realmC_RangeError);
        defineCall(obj, RangeError_Call);
        defineConstruct(obj, RangeError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'ReferenceError', function() {
        var obj = createRealmObject(realmC_ReferenceError);
        defineCall(obj, ReferenceError_Call);
        defineConstruct(obj, ReferenceError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'SyntaxError', function() {
        var obj = createRealmObject(realmC_SyntaxError);
        defineCall(obj, SyntaxError_Call);
        defineConstruct(obj, SyntaxError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'TypeError', function() {
        var obj = createRealmObject(realmC_TypeError);
        defineCall(obj, TypeError_Call);
        defineConstruct(obj, TypeError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'URIError', function() {
        var obj = createRealmObject(realmC_URIError);
        defineCall(obj, URIError_Call);
        defineConstruct(obj, URIError_Construct);
        obj.Prototype = realm.Function_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'JSON', function() {
        var obj = createRealmObject(realmC_JSON);
        obj.Prototype = realm.Object_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'theGlobalObject', function() {
        var obj = createRealmObject(realmC_theGlobalObject);
        obj.Prototype = realm.Object_prototype;
        return obj;
    });
    realmClassDefine(realmClass, 'theGlobalEnvironment', function() {
        var obj = NewObjectEnvironment(realm.theGlobalObject, null);
        return obj;
    });
    realmClassDefine(realmClass, 'theThrowTypeError', createThrowTypeErrorObject);
    return realmClass;
}

function initializeRealm(realmClass) {
    realm = Object.create(realmClass);
    realm.theEvalFunction = intrinsic_get(realm.theGlobalObject, "eval");
}
