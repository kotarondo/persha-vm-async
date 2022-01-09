function f(a) { return arguments }
var a = ',1';
for (var i = 0; i < 14; i++) {
    a = a + a;
}

while (true) eval('f.bind(null' + a + ')');
