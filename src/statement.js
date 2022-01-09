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

// ECMAScript 5.1: 12 Statements

function BlockStatement(statementList) {
    async function evaluate() {
        if (statementList === undefined) return CompletionValue("normal", empty, empty);
        return await statementList.evaluate();
    }

    function compile(ctx) {
        if (statementList === undefined) return;
        ctx.compileStatement(statementList);
    }
    return { evaluate, compile, statementList };
}

function StatementList(statements) {
    if (statements.length === 0) return;

    async function evaluate() {
        var sl = CompletionValue("normal", empty, empty);
        for (var i = 0; i < statements.length; i++) {
            if (sl.type !== "normal") return sl;
            try {
                var statement = statements[i];
                var s = await statement.evaluate();
            } catch (V) {
                if (isInternalError(V)) throw V;
                return CompletionValue("throw", V, empty);
            }
            if (s.value === empty) {
                var V = sl.value;
            } else {
                var V = s.value;
            }
            sl = CompletionValue(s.type, V, s.target);
        }
        return sl;
    }

    function compile(ctx) {
        for (var i = 0; i < statements.length; i++) {
            ctx.compileStatement(statements[i]);
        }
    }
    return { evaluate, compile };
}

function VariableStatement(variableDeclarationList) {
    async function evaluate() {
        for (var i = 0; i < variableDeclarationList.length; i++) {
            var variableDeclaration = variableDeclarationList[i];
            await variableDeclaration.evaluate();
        }
        return CompletionValue("normal", empty, empty);
    }

    function compile(ctx) {
        for (var i = 0; i < variableDeclarationList.length; i++) {
            variableDeclarationList[i].compile(ctx);
        }
    }
    return { evaluate, compile };
}

function VariableDeclaration(staticEnv, identifier, initialiser, strict, pos) {
    async function evaluate() {
        if (initialiser !== undefined) {
            setRunningPos(pos);
            var env = LexicalEnvironment;
            var lhs = GetIdentifierReference(env, identifier, strict);
            var rhs = await initialiser.evaluate();
            var value = await GetValue(rhs);
            await PutValue(lhs, value);
        }
        return identifier;
    }

    function compile(ctx) {
        if (initialiser !== undefined) {
            ctx.compileRunningPos(pos);
            var lhs = ctx.compileGetIdentifierReferece(staticEnv, identifier, strict);
            var rhs = ctx.compileExpression(initialiser);
            var value = ctx.compileGetValue(rhs);
            ctx.compilePutValue(lhs, value);
        }
        return {
            env: staticEnv,
            name: identifier,
        };
    }
    return { evaluate, compile };
}

function EmptyStatement() {
    async function evaluate() {
        return CompletionValue("normal", empty, empty);
    }

    function compile(ctx) {
        // do nothing
    }
    return { evaluate, compile };
}

function ExpressionStatement(expression, pos) {
    async function evaluate() {
        setRunningPos(pos);
        var exprRef = await expression.evaluate();
        return CompletionValue("normal", await GetValue(exprRef), empty);
    }

    function compile(ctx) {
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        ctx.compileGetValue(exprRef);
    }
    return { evaluate, compile };
}

function IfStatement(expression, firstStatement, secondStatement, pos) {
    async function evaluate() {
        setRunningPos(pos);
        var exprRef = await expression.evaluate();
        if (ToBoolean(await GetValue(exprRef)) === true) return await firstStatement.evaluate();
        else {
            if (secondStatement === undefined) return CompletionValue("normal", empty, empty);
            return await secondStatement.evaluate();
        }
    }

    function compile(ctx) {
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        var val = ctx.compileGetValue(exprRef);
        ctx.text("if(" + val.name + "){");
        ctx.compileStatement(firstStatement);
        if (secondStatement) {
            ctx.text("}else{");
            ctx.compileStatement(secondStatement);
        }
        ctx.text("}");
    }
    return { evaluate, compile };
}

function DoWhileStatement(statement, expression, labelset, pos) {
    async function evaluate() {
        var V = empty;
        while (true) {
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                    return CompletionValue("normal", V, empty);
                if (stmt.type !== "normal") return stmt;
            }
            setRunningPos(pos);
            var exprRef = await expression.evaluate();
            if (ToBoolean(await GetValue(exprRef)) === false) {
                break;
            }
        }
        return CompletionValue("normal", V, empty);
    }

    function compile(ctx) {
        ctx.iterables++;
        var i = ctx.defineBoolean("false");
        ctx.compileLabelset(labelset);
        ctx.text("for(;; " + i.name + " =true){");
        ctx.text("if(" + i.name + "){");
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        var val = ctx.compileGetValue(exprRef);
        ctx.text("if(! " + val.name + ")break;");
        ctx.text("}");
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function WhileStatement(expression, statement, labelset, pos) {
    async function evaluate() {
        var V = empty;
        while (true) {
            setRunningPos(pos);
            var exprRef = await expression.evaluate();
            if (ToBoolean(await GetValue(exprRef)) === false) {
                break;
            }
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                    return CompletionValue("normal", V, empty);
                if (stmt.type !== "normal") return stmt;
            }
        }
        return CompletionValue("normal", V, empty);
    }

    function compile(ctx) {
        ctx.iterables++;
        ctx.compileLabelset(labelset);
        ctx.text("while(true){");
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        var val = ctx.compileGetValue(exprRef);
        ctx.text("if(! " + val.name + ")break;");
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function ForStatement(expressionNoIn, firstExpression, secondExpression, statement, labelset, pos1, pos2, pos3) {
    async function evaluate() {
        if (expressionNoIn !== undefined) {
            setRunningPos(pos1);
            var exprRef = await expressionNoIn.evaluate();
            await GetValue(exprRef);
        }
        var V = empty;
        while (true) {
            setRunningPos(pos2);
            if (firstExpression !== undefined) {
                var testExprRef = await firstExpression.evaluate();
                if (ToBoolean(await GetValue(testExprRef)) === false) return CompletionValue("normal", V, empty);
            }
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                return CompletionValue("normal", V, empty);
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type !== "normal") return stmt;
            }
            if (secondExpression !== undefined) {
                setRunningPos(pos3);
                var incExprRef = await secondExpression.evaluate();
                await GetValue(incExprRef);
            }
        }
    }

    function compile(ctx) {
        ctx.iterables++;
        if (expressionNoIn !== undefined) {
            ctx.compileRunningPos(pos1);
            var exprRef = ctx.compileExpression(expressionNoIn);
            ctx.compileGetValue(exprRef);
        }
        var i = ctx.defineBoolean("false");
        ctx.compileLabelset(labelset);
        ctx.text("for(;; " + i.name + " =true){");
        if (secondExpression !== undefined) {
            ctx.text("if(" + i.name + "){");
            ctx.compileRunningPos(pos3);
            var incExprRef = ctx.compileExpression(secondExpression);
            ctx.compileGetValue(incExprRef);
            ctx.text("}");
        }
        ctx.compileRunningPos(pos2);
        if (firstExpression !== undefined) {
            var testExprRef = ctx.compileExpression(firstExpression);
            var val = ctx.compileGetValue(testExprRef);
            ctx.text("if(! " + val.name + ")break;");
        }
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function ForVarStatement(variableDeclarationList, firstExpression, secondExpression, statement, labelset, pos1, pos2) {
    async function evaluate() {
        for (var i = 0; i < variableDeclarationList.length; i++) {
            var variableDeclaration = variableDeclarationList[i];
            await variableDeclaration.evaluate();
        }
        var V = empty;
        while (true) {
            setRunningPos(pos1);
            if (firstExpression !== undefined) {
                var testExprRef = await firstExpression.evaluate();
                if (ToBoolean(await GetValue(testExprRef)) === false) return CompletionValue("normal", V, empty);
            }
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                return CompletionValue("normal", V, empty);
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type !== "normal") return stmt;
            }
            if (secondExpression !== undefined) {
                setRunningPos(pos2);
                var incExprRef = await secondExpression.evaluate();
                await GetValue(incExprRef);
            }
        }
    }

    function compile(ctx) {
        ctx.iterables++;
        for (var i = 0; i < variableDeclarationList.length; i++) {
            variableDeclarationList[i].compile(ctx);
        }
        var i = ctx.defineBoolean("false");
        ctx.compileLabelset(labelset);
        ctx.text("for(;; " + i.name + " =true){");
        if (secondExpression !== undefined) {
            ctx.text("if(" + i.name + "){");
            ctx.compileRunningPos(pos2);
            var incExprRef = ctx.compileExpression(secondExpression);
            ctx.compileGetValue(incExprRef);
            ctx.text("}");
        }
        ctx.compileRunningPos(pos1);
        if (firstExpression !== undefined) {
            var testExprRef = ctx.compileExpression(firstExpression);
            var val = ctx.compileGetValue(testExprRef);
            ctx.text("if(! " + val.name + ")break;");
        }
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function ForInStatement(leftHandSideExpression, expression, statement, labelset, pos1, pos2) {
    async function evaluate() {
        setRunningPos(pos2);
        var exprRef = await expression.evaluate();
        var experValue = await GetValue(exprRef);
        if (experValue === null || experValue === undefined) return CompletionValue("normal", empty, empty);
        var obj = await ToObject(experValue);
        var V = empty;
        var next = obj.enumerator(false, true);
        while (true) {
            var P = next();
            if (P === undefined) return CompletionValue("normal", V, empty);
            setRunningPos(pos1);
            var lhsRef = await leftHandSideExpression.evaluate();
            await PutValue(lhsRef, P);
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                return CompletionValue("normal", V, empty);
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type !== "normal") return stmt;
            }
        }
    }

    function compile(ctx) {
        ctx.iterables++;
        ctx.compileRunningPos(pos2);
        var exprRef = ctx.compileExpression(expression);
        var experValue = ctx.compileGetValue(exprRef);
        experValue = ctx.unify(experValue);
        ctx.text("if(!(" + experValue.name + " ===null|| " + experValue.name + " ===undefined)){");
        var obj = ctx.compileToObject(experValue);
        var next = ctx.defineAny(obj.name + " .enumerator(false,true)");
        ctx.compileLabelset(labelset);
        ctx.text("while(true){");
        var P = ctx.defineString(next.name + "()");
        ctx.text("if(" + P.name + " ===undefined)break;");
        ctx.compileRunningPos(pos1);
        var lhsRef = ctx.compileExpression(leftHandSideExpression);
        ctx.compilePutValue(lhsRef, P);
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function ForVarInStatement(variableDeclarationNoIn, expression, statement, labelset, strict, pos1, pos2) {
    async function evaluate() {
        var varName = await variableDeclarationNoIn.evaluate();
        setRunningPos(pos2);
        var exprRef = await expression.evaluate();
        var experValue = await GetValue(exprRef);
        if (experValue === null || experValue === undefined) return CompletionValue("normal", empty, empty);
        var obj = await ToObject(experValue);
        var V = empty;
        var next = obj.enumerator(false, true);
        while (true) {
            var P = next();
            if (P === undefined) return CompletionValue("normal", V, empty);
            setRunningPos(pos1);
            var env = LexicalEnvironment;
            var varRef = GetIdentifierReference(env, varName, strict);
            await PutValue(varRef, P);
            var stmt = await statement.evaluate();
            if (stmt.value !== empty) {
                V = stmt.value;
            }
            if (stmt.type === "break" && isInLabelSet(stmt.target, labelset) === true)
                return CompletionValue("normal", V, empty);
            if (stmt.type !== "continue" || isInLabelSet(stmt.target, labelset) === false) {
                if (stmt.type !== "normal") return stmt;
            }
        }
    }

    function compile(ctx) {
        ctx.iterables++;
        var varRef = variableDeclarationNoIn.compile(ctx);
        ctx.compileRunningPos(pos2);
        var exprRef = ctx.compileExpression(expression);
        var experValue = ctx.compileGetValue(exprRef);
        experValue = ctx.unify(experValue);
        ctx.text("if(!(" + experValue.name + " ===null|| " + experValue.name + " ===undefined)){");
        var obj = ctx.compileToObject(experValue);
        var next = ctx.defineAny(obj.name + " .enumerator(false,true)");
        ctx.compileLabelset(labelset);
        ctx.text("while(true){");
        var P = ctx.defineString(next.name + "()");
        ctx.text("if(" + P.name + " ===undefined)break;");
        ctx.compileRunningPos(pos1);
        var varRef = ctx.compileGetIdentifierReferece(varRef.env, varRef.name, strict);
        ctx.compilePutValue(varRef, P);
        ctx.compileStatement(statement);
        ctx.text("}");
        ctx.text("}");
        ctx.iterables--;
    }
    return { evaluate, compile };
}

function ContinueStatement(identifier) {
    async function evaluate() {
        if (identifier === undefined) return CompletionValue("continue", empty, empty);
        else return CompletionValue("continue", empty, identifier);
    }

    function compile(ctx) {
        if (!identifier) {
            ctx.text("continue;");
            return;
        }
        ctx.text("continue " + ctx.findLabel(identifier) + ";");
    }
    return { evaluate, compile };
}

function BreakStatement(identifier) {
    async function evaluate() {
        if (identifier === undefined) return CompletionValue("break", empty, empty);
        else return CompletionValue("break", empty, identifier);
    }

    function compile(ctx) {
        if (!identifier) {
            ctx.text("break;");
            return;
        }
        ctx.text("break " + ctx.findLabel(identifier) + ";");
    }
    return { evaluate, compile };
}

function ReturnStatement(expression, pos) {
    async function evaluate() {
        if (expression === undefined) return CompletionValue("return", undefined, empty);
        setRunningPos(pos);
        var exprRef = await expression.evaluate();
        return CompletionValue("return", await GetValue(exprRef), empty);
    }

    function compile(ctx) {
        if (expression === undefined) return ctx.compileReturn(COMPILER_UNDEFINED_VALUE);
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        ctx.compileReturn(ctx.compileGetValue(exprRef));
    }
    return { evaluate, compile };
}

function WithStatement(expression, statement, pos) {
    async function evaluate() {
        setRunningPos(pos);
        var val = await expression.evaluate();
        var obj = await ToObject(await GetValue(val));
        var oldEnv = LexicalEnvironment;
        var newEnv = NewObjectEnvironment(obj, oldEnv);
        newEnv.provideThis = true;
        LexicalEnvironment = newEnv;
        try {
            var C = await statement.evaluate();
        } catch (V) {
            if (isInternalError(V)) throw V;
            C = CompletionValue("throw", V, empty);
        }
        LexicalEnvironment = oldEnv;
        return C;
    }

    function compile(ctx) {
        ctx.compileRunningPos(pos);
        var val = ctx.compileExpression(expression);
        var obj = ctx.compileToObject(ctx.compileGetValue(val));
        var oldEnv = ctx.defineAny("LexicalEnvironment");
        ctx.text("LexicalEnvironment=NewObjectEnvironment(" + obj.name + "," + oldEnv.name + ");");
        ctx.text("LexicalEnvironment.provideThis=true;");
        ctx.text("try{");
        ctx.compileStatement(statement);
        ctx.text("}finally{");
        ctx.text("LexicalEnvironment= " + oldEnv.name + ";");
        ctx.text("}");
    }
    return { evaluate, compile };
}

function SwitchStatement(expression, caseBlock, labelset, pos) {
    async function evaluate() {
        setRunningPos(pos);
        var exprRef = await expression.evaluate();
        var R = await caseBlock.evaluate(await GetValue(exprRef));
        if (R.type === "break" && isInLabelSet(R.target, labelset) === true) return CompletionValue("normal", R.value, empty);
        return R;
    }

    function compile(ctx) {
        ctx.switches++;
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        caseBlock.compile(ctx, ctx.compileGetValue(exprRef));
        ctx.switches--;
    }
    return { evaluate, compile };
}

function CaseBlock(A, defaultClause, B) {
    async function evaluate(input) {
        var V = empty;
        var found = false;
        for (var i = 0; i < A.length; i++) {
            var C = A[i];
            if (found === false) {
                var clauseSelector = await C.evaluate();
                if (input === clauseSelector) {
                    found = true;
                }
            }
            if (found === true) {
                if (C.statementList !== undefined) {
                    var R = await C.statementList.evaluate();
                    if (R.value !== empty) {
                        V = R.value;
                    }
                    if (R.type !== "normal") return CompletionValue(R.type, V, R.target);
                }
            }
        }
        var foundInB = false;
        if (found === false && B !== undefined) {
            for (var j = 0; foundInB === false && (j < B.length); j++) {
                var C = B[j];
                var clauseSelector = await C.evaluate();
                if (input === clauseSelector) {
                    foundInB = true;
                    if (C.statementList !== undefined) {
                        var R = await C.statementList.evaluate();
                        if (R.value !== empty) {
                            V = R.value;
                        }
                        if (R.type !== "normal") return CompletionValue(R.type, V, R.target);
                    }
                }
            }
        }
        if (foundInB === false && defaultClause !== undefined) {
            var R = await defaultClause.evaluate();
            if (R.value !== empty) {
                V = R.value;
            }
            if (R.type !== "normal") return CompletionValue(R.type, V, R.target);
        }
        // specification Bug 345
        if (foundInB === false) {
            j = 0;
        }
        // end of bug fix
        for (; j < B.length; j++) {
            var C = B[j];
            if (C.statementList !== undefined) {
                var R = await C.statementList.evaluate();
                if (R.value !== empty) {
                    V = R.value;
                }
                if (R.type !== "normal") return CompletionValue(R.type, V, R.target);
            }
        }
        return CompletionValue("normal", V, empty);
    }

    function compile(ctx, input) {
        input = ctx.unify(input);
        var mark = ctx.texts.length;
        var selectors = [];
        var direct = true;
        ctx.text("Lcases:{");
        for (var i = 0; i < A.length; i++) {
            var C = A[i];
            var l = ctx.texts.length;
            var clauseSelector = ctx.compileExpression(C);
            direct = clauseSelector.isLiteral ? direct : false;
            selectors[i] = clauseSelector;
            ctx.text("if(" + input.name + " === " + clauseSelector.name + "){");
            ctx.text("var swidx= " + i + ";");
            ctx.text("break Lcases;");
            ctx.text("}");
        }
        for (var j = 0; j < B.length; j++) {
            var C = B[j];
            var clauseSelector = ctx.compileExpression(C);
            direct = clauseSelector.isLiteral ? direct : false;
            selectors[i + j] = clauseSelector;
            ctx.text("if(" + input.name + " === " + clauseSelector.name + "){");
            ctx.text("var swidx= " + (i + j) + ";");
            ctx.text("break Lcases;");
            ctx.text("}");
        }
        ctx.text("var swidx =-1;");
        ctx.text("}");
        direct = (ctx.texts.length === mark + (i + j) * 4 + 3) ? direct : false;
        if (direct) {
            ctx.texts.length = mark;
            ctx.text("switch(" + input.name + "){");
        } else ctx.text("switch(swidx){");
        for (var i = 0; i < A.length; i++) {
            var C = A[i];
            if (direct) ctx.text("case " + selectors[i].name + ":");
            else ctx.text("case " + i + ":");
            if (C.statementList) {
                ctx.compileStatement(C.statementList);
            }
        }
        if (defaultClause) {
            ctx.text("default:");
            ctx.compileStatement(defaultClause);
        }
        for (var j = 0; j < B.length; j++) {
            var C = B[j];
            if (direct) ctx.text("case " + selectors[i + j].name + ":");
            else ctx.text("case " + (i + j) + ":");
            if (C.statementList) {
                ctx.compileStatement(C.statementList);
            }
        }
        ctx.text("}");
    }
    return { evaluate, compile };
}

function CaseClause(expression, statementList, pos) {
    var caseClause = CompilerContext.expression(function compile(ctx) {
        var exprRef = ctx.compileExpression(expression);
        return ctx.compileGetValue(exprRef);
    });
    caseClause.statementList = statementList;
    return caseClause;
}

function isInLabelSet(target, labelset) {
    if (target === empty) return true;
    if (labelset === undefined) return false;
    if (isIncluded(target, labelset)) return true;
    return false;
}

function LabelledStatement(identifier, statement, iterable) {
    async function evaluate() {
        var stmt = await statement.evaluate();
        if (stmt.type === "break" && stmt.target === identifier) return CompletionValue("normal", stmt.value, empty);
        return stmt;
    }

    function compile(ctx) {
        var label = ctx.openLabel(identifier);
        if (!iterable) ctx.text(label + ":{");
        ctx.compileStatement(statement);
        if (!iterable) ctx.text("}");
        ctx.closeLabel(identifier);
    }
    return { evaluate, compile };
}

function ThrowStatement(expression, pos) {
    async function evaluate() {
        setRunningPos(pos);
        var exprRef = await expression.evaluate();
        return CompletionValue("throw", await GetValue(exprRef), empty);
    }

    function compile(ctx) {
        ctx.compileRunningPos(pos);
        var exprRef = ctx.compileExpression(expression);
        var val = ctx.compileGetValue(exprRef);
        ctx.text("throw " + val.name + ";");
    }
    return { evaluate, compile };
}

function TryStatement(block, catchBlock, finallyBlock) {
    async function evaluate() {
        if (finallyBlock === undefined) {
            var B = await block.evaluate();
            if (B.type !== "throw") return B;
            return await catchBlock.evaluate(B.value);
        }

        if (catchBlock === undefined) {
            var B = await block.evaluate();
            var F = await finallyBlock.evaluate();
            if (F.type === "normal") return B;
            return F;
        }

        var B = await block.evaluate();
        if (B.type === "throw") {
            var C = await catchBlock.evaluate(B.value);
        } else {
            var C = B;
        }
        var F = await finallyBlock.evaluate();
        if (F.type === "normal") return C;
        return F;
    }

    function compile(ctx) {
        ctx.text("try{var interr;");
        ctx.compileStatement(block);
        ctx.text("}catch(err){");
        ctx.text("if(isInternalError(err)){interr=err;throw err;}");
        if (catchBlock) {
            catchBlock.compile(ctx);
        } else {
            ctx.text("throw err;");
        }
        if (finallyBlock) {
            ctx.text("}finally{if(interr)throw interr;");
            ctx.compileStatement(finallyBlock);
        }
        ctx.text("}");
    }
    return { evaluate, compile };
}

function CatchBlock(staticEnv, identifier, block) {
    async function evaluate(C) {
        var oldEnv = LexicalEnvironment;
        var catchEnv = NewDeclarativeEnvironment(oldEnv);
        var envRec = catchEnv;
        await envRec.CreateMutableBinding(identifier);
        await envRec.SetMutableBinding(identifier, C, false);
        LexicalEnvironment = catchEnv;
        var B = await block.evaluate();
        LexicalEnvironment = oldEnv;
        return B;
    }

    function compile(ctx) {
        if (!block.statementList) return;
        var oldEnv = ctx.compileNewDeclarativeEnvironment(staticEnv);
        ctx.compileCreateMutableBinding(staticEnv, identifier);
        ctx.compileSetMutableBinding(staticEnv, identifier, ctx.defineValue("err"), false);
        if (!oldEnv) {
            ctx.compileStatement(block);
            return;
        }
        ctx.text("try{");
        ctx.compileStatement(block);
        ctx.text("}finally{");
        ctx.text("LexicalEnvironment= " + oldEnv.name + ";");
        ctx.text("}");
    }
    return { evaluate, compile };
}

function DebuggerStatement(pos) {
    async function evaluate() {
        setRunningPos(pos);
        debugger;
        return CompletionValue("normal", empty, empty);
    }

    function compile(ctx) {
        ctx.compileRunningPos(pos);
        ctx.text("debugger;");
    }
    return { evaluate, compile };
}
