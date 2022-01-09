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

// ECMAScript 5.1: 14 Program

function SourceElements(statements) {
    if (statements.length === 0) return;

    async function evaluate() {
        try {
            var headResult = CompletionValue("normal", empty, empty);
            for (var i = 0; i < statements.length; i++) {
                if (headResult.type !== "normal") return headResult;
                var statement = statements[i];
                var tailResult = await statement.evaluate();
                if (tailResult.value === empty) {
                    var V = headResult.value;
                } else {
                    var V = tailResult.value;
                }
                headResult = CompletionValue(tailResult.type, V, tailResult.target);
            }
            return headResult;
        } catch (V) {
            if (isInternalError(V)) throw V;
            return CompletionValue("throw", V, empty);
        }
    };

    function compile(ctx) {
        for (var i = 0; i < statements.length; i++) {
            ctx.compileStatement(statements[i]);
        }
    }
    return { evaluate, compile };
}

function NewSourceObject(type, params, source, strict, filename) {
    if (filename === undefined) {
        filename = "<unknown>";
    }
    assert(typeof(filename) === "string", filename);
    var obj = {};
    obj.type = type;
    obj.params = params;
    obj.source = source;
    obj.strict = strict;
    obj.filename = filename;
    obj.subcodes = undefined;
    return obj;
}
