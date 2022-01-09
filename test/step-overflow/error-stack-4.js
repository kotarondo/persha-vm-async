Error.stackTraceLimit = Infinity;

function f(a) {
    if (a < 1000) return f(a + 1);
    return new Error();
}
var err = f(2);
while (true) err.stack;
