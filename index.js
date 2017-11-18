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

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var context = global;

// for debug
context.console = console;

var filenames = ['helper.js', 'unicode.js', 'regexp_compiler.js', 'compiler.js', 'builtinArray.js', 'builtinBoolean.js', 'builtinDate.js', 'builtinError.js', 'builtinFunction.js', 'builtinGlobal.js', 'builtinJSON.js', 'builtinMath.js', 'builtinNumber.js', 'builtinObject.js', 'builtinRegExp.js', 'builtinString.js', 'conversion.js', 'expression.js', 'function.js', 'statement.js', 'program.js', 'parser.js', 'execution.js', 'types.js', 'realm.js', 'misc.js'];

for (var filename of filenames) {
    var text = fs.readFileSync(path.join(__dirname, 'src', filename), 'utf8');
    vm.runInThisContext(text, { filename, displayErrors: true });
}

Object.defineProperty(VM, 'LocalTZA', {
    get: () => context.LocalTZA,
    set: v => context.LocalTZA = v,
    enumerable: false,
    configurable: false,
});

Object.defineProperty(VM, 'LocalTZAString', {
    get: () => context.LocalTZAString,
    set: v => context.LocalTZAString = v,
    enumerable: false,
    configurable: false,
});

function VM() {
    var realm;

    this.initialize = function() {
        context.setRealm(null);
        context.initializeRealm();
        realm = context.getRealm();
    }

    this.evaluateProgram = async function(text, filename) {
        var saved = context.getRealm();
        context.setRealm(realm);
        var result = await context.evaluateProgram(text, filename);
        context.setRealm(saved);
        return result;
    }
}

module.exports = VM;
