function fn() { return arguments; }
var a = '1,';
for (var i = 0; i < 17; i++) {
    a = a + a;
}
while (true) {
    eval('fn(' + a + '2)');
}
