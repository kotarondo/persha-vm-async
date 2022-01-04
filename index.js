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
var assert = require('assert');

var prefix = "_prsh";
var index = 0;
var filenames = ['helper.js', 'unicode.js', 'regexp_compiler.js', 'compiler.js', 'builtinArray.js', 'builtinBoolean.js', 'builtinDate.js', 'builtinError.js', 'builtinFunction.js', 'builtinGlobal.js', 'builtinJSON.js', 'builtinMath.js', 'builtinNumber.js', 'builtinObject.js', 'builtinRegExp.js', 'builtinString.js', 'conversion.js', 'expression.js', 'function.js', 'statement.js', 'program.js', 'parser.js', 'execution.js', 'types.js', 'realm.js', 'misc.js'];

function registerName(name, map) {
    if (/\W/.test(name) || map[name]) {
        var err = new Error("NG: invalid name:" + name);
        debugger;
        throw err;
    }
    map[name] = prefix + (index++);
}

class VM {
    constructor(plugins = []) {
        var context = Object.create(null);
        var map = Object.create(null);
        var codes = [];
        for (var filename of filenames) {
            var text = fs.readFileSync(path.join(__dirname, 'src', filename), 'utf8');
            codes.push({ filename: 'src/' + filename, text });
        }
        codes = codes.concat(plugins);
        for (var code of codes) {
            var { filename, text } = code;
            var split = text.split(/\b|(?=\n)/);
            split.forEach(function(e, i) {
                if (e !== '\n') return;
                switch (split[i + 1]) {
                    case 'async':
                        assert(split[i + 2] === ' ');
                        assert(split[i + 3] === 'function');
                        assert(split[i + 4] === ' ');
                        var name = split[i + 5];
                        break;
                    case 'function':
                        assert(split[i + 2] === ' ');
                        var name = split[i + 3];
                        break;
                    case 'const':
                        assert(split[i + 2] === ' ');
                        var name = split[i + 3];
                        break;
                    case 'var':
                        assert(split[i + 2] === ' ');
                        var name = split[i + 3];
                        break;
                    default:
                        return;
                }
                registerName(name, map);
            });
        }
        for (var code of codes) {
            var { filename, text } = code;
            var split = text.split(/\b|(?=\n)/);
            split.forEach(function(e, i) {
                var n = map[e];
                if (n) { split[i] = n; }
            });
            var text = split.join('');
            require('vm').runInThisContext(text, { filename, displayErrors: true });
        }
        for (var name of Object.keys(map)) {
            let mn = map[name];
            Object.defineProperty(context, name, {
                get: () => global[mn],
                set: v => global[mn] = v,
                enumerable: false,
                configurable: false,
            });
        }
        this.context = context;
        this.realmClass = context.initializeRealmClass();
    }

    createRealm() {
        var context = this.context;
        var realmClass = this.realmClass;
        var saved = context.realm;
        context.realm = null;
        context.initializeRealm(realmClass);
        var realm = context.realm;
        context.realm = saved;
        return realm;
    }

    async evaluateProgram(realm, text, filename) {
        var context = this.context;
        var saved = context.realm;
        context.realm = realm;
        var result = await context.evaluateProgram(text, filename);
        context.realm = saved;
        return result;
    }

    async evaluateFunction(realm, parameterText, codeText, filename, args) {
        var context = this.context;
        var saved = context.realm;
        context.realm = realm;
        var result = await context.evaluateFunction(parameterText, codeText, filename, args);
        context.realm = saved;
        return result;
    }
}

module.exports = VM;
