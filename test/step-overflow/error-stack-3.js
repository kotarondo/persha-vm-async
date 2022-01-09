Error.stackTraceLimit = Infinity;

function f(a) {
    if (a < 1000) return f(a + 1);
    while (true) new Error();
}

f(2);
