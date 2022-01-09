var a = 'eval(1+';
var b = ')';
for (var i = 0; i < 8; i++) {
    a = a + a;
    b = b + b;
}
while (true) {
    try {
        eval(a + '1' + b);
    } catch (err) {
        if (err instanceof SyntaxError && err.message === 'Maximum parse stack size exceeded') continue;
        throw err;
    }
}
