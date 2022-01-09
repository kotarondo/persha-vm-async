var a = 'function fn(){';
var b = '}';
for (var i = 0; i < 8; i++) {
    if (a.length + b.length > 1e6 / 2) break;
    a = a + a;
    b = b + b;
}
while (true) {
    try {
        eval(a + b);
    } catch (err) {
        if (err instanceof SyntaxError && err.message === 'Maximum parse stack size exceeded') continue;
        throw err;
    }
}
