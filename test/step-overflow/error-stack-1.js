Error.stackTraceLimit = Infinity;

function f(a) {
    if (a < 100) return f(a + 1);
    while (true) new Error();
}

f(0);
