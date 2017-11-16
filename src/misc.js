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

function saveEntireContext() {
    return {
        realm,
        LexicalEnvironment,
        VariableEnvironment,
        ThisBinding,
        runningFunction,
        runningCode,
        runningSourcePos,
        outerExecutionContext,
        stackDepth,
    };
    realm = undefined;
    LexicalEnvironment = undefined;
    VariableEnvironment = undefined;
    ThisBinding = undefined;
    runningFunction = undefined;
    runningCode = undefined;
    runningSourcePos = undefined;
    stackDepth = 0;
}

function restoreEntireContext(ctx) {
    realm = ctx.realm;
    LexicalEnvironment = ctx.LexicalEnvironment;
    VariableEnvironment = ctx.VariableEnvironment;
    ThisBinding = ctx.ThisBinding;
    runningFunction = ctx.runningFunction;
    runningCode = ctx.runningCode;
    runningSourcePos = ctx.runningSourcePos;
    stackDepth = ctx.stackDepth;
}

async function callEvaluateProgram(text, filename) {
    assert(typeof text === "string");
    assert(!filename || typeof filename === "string");
    try {
        var prog = Parser.readCode("global", "", text, false, [], filename);
    } catch (e) {
        if (e instanceof Parser.SyntaxError) {
            throw new SyntaxError(e.message);
        }
        if (e instanceof Parser.ReferenceError) {
            throw new ReferenceError(e.message);
        }
        throw e;
    }
    await enterExecutionContextForGlobalCode(prog);
    try {
        var result = await prog.evaluate();
    } finally {
        exitExecutionContext();
    }
    if (result.type === "normal") return;
    assert(result.type === "throw", result);
    throw result.value;
}

function nonDeterministicValue(v) {
    return v;
    throw VMError("not implemented"); // TODO
}
