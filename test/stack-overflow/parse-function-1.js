// expect: 'SyntaxError: Maximum parse stack size exceeded'

var a = 'function fn(){';
var b = '}';
for (var i = 0; i < 11; i++) {
    a = a + a;
    b = b + b;
}
eval(a + b);
