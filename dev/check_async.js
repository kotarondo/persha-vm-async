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

var filenames = fs.readdirSync(path.join(__dirname, '..', 'src'));

var name, line;
function assert(exp) {
    if (exp) return;
    console.log(filename, line, name);
}

var codes = [];
var sync_functions = Object.create(null);
var async_functions = Object.create(null);
var unknown_functions = Object.create(null);

for (var filename of filenames) {
    if(!/\.js$/.test(filename)) continue;
    var text = fs.readFileSync(path.join(__dirname, '..', 'src', filename), 'utf8');
    var split = text.split(/\b|(?=\n)/);
    line = 0;
    split.forEach(function(e, i) {
        if (e[0] === '\n') line++;
        if (e !== '\n') return;
        var head = split[i + 1];
        if (head === 'function') {
            name = split[i + 3];
            sync_functions[name] = true;
        }
        if (head === 'async') {
            name = split[i + 5];
            async_functions[name] = true;
            assert(split[i + 3] === 'function');
        }
    });
    codes.push({ filename, text, split });
}

var async_methods = {
    Get: true,
    Put: true,
    DefineOwnProperty: true,
    DefaultValue: true,
    Call: true,
    Construct: true,
};

for (var code of codes) {
    var { filename, text, split } = code;
    line = 1;
    split.forEach(function(e, i) {
        if (e[0] === '\n') line++;
        if (e === 'await') {
            name = e;
            assert(split[i - 2] !== 'return');
            name = split[i + 2];
            assert(split[i + 1] === ' ');
            assert(!sync_functions[name]);
            if (async_functions[name]) {
                assert(split[i + 3][0] === '(' || (split[i + 3] === '.' && split[i + 4] === 'call'));
            }else if(split[i + 3] === '.'){
                name = split[i + 4];
                while(split[i + 5] === '.'){
                    i+=2;
                    name = split[i + 4];
                }
                assert(async_methods[name]);
                assert(split[i + 5][0] === '(');
            } else {
                assert(split[i + 3][0] === '(');
            }
        }
        if (e[0] === '(') {
            name = split[i - 1];
            if (name === 'call') {
                assert(split[i - 2] === '.');
                i -= 2;
                name = split[i - 1];
            }
            if (split[i - 2] === '.') {
                if (async_methods[name]) {
                    while(split[i - 4] === '.'){
                        i-=2;
                    }
                    if(split[i - 4] === ' '){
                        assert(split[i - 5] === 'await' || split[i - 5] === 'return');
                    }
                } else {
                    assert(split[i - 5] !== 'await');
                }
            } else {
                if (sync_functions[name]) {
                    assert(split[i - 3] !== 'await');
                } else if (async_functions[name]) {
                    assert(split[i - 2] === ' ');
                    assert(split[i - 3] === 'await' || split[i - 3] === 'return' || split[i - 3] === 'function');
                } else {
                    unknown_functions[name] = true;
                }
            }
        }
    });
}

console.log(Object.keys(unknown_functions));
