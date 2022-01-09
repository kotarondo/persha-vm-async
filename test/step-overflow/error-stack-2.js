Error.stackTraceLimit = Infinity;

function f(a) {
    if (a < 100) return f(a + 1);
    return new Error();
}
var err = f(0);
while (true) err.stack;
