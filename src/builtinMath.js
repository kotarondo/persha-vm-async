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

// ECMAScript 5.1: 15.8 The Math Object

async function Math_abs(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return Math.abs(x);
}

async function Math_acos(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.acos(x));
}

async function Math_asin(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.asin(x));
}

async function Math_atan(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.atan(x));
}

async function Math_atan2(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    var y = await ToNumber(argumentsList[1]);
    return nonDeterministicValue(Math.atan2(x, y));
}

async function Math_ceil(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return Math.ceil(x);
}

async function Math_cos(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.cos(x));
}

async function Math_exp(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.exp(x));
}

async function Math_floor(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return Math.floor(x);
}

async function Math_log(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.log(x));
}

async function Math_max(thisValue, argumentsList) {
    var result = -Infinity;
    for (var i = 0; i < argumentsList.length; i++) {
        var value = await ToNumber(argumentsList[i]);
        var result = Math.max(result, value);
    }
    return result;
}

async function Math_min(thisValue, argumentsList) {
    var result = Infinity;
    for (var i = 0; i < argumentsList.length; i++) {
        var value = await ToNumber(argumentsList[i]);
        var result = Math.min(result, value);
    }
    return result;
}

async function Math_pow(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    var y = await ToNumber(argumentsList[1]);
    return nonDeterministicValue(Math.pow(x, y));
}

async function Math_random(thisValue, argumentsList) {
    return nonDeterministicValue(Math.random());
}

async function Math_round(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return Math.round(x);
}

async function Math_sin(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.sin(x));
}

async function Math_sqrt(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.sqrt(x));
}

async function Math_tan(thisValue, argumentsList) {
    var x = await ToNumber(argumentsList[0]);
    return nonDeterministicValue(Math.tan(x));
}
