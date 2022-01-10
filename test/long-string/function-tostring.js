var a = 'a';
for (var i = 0; i < 17; i++) a = a + a;
var p = a;
while (true) {
    var f = new Function(p, a);
    f.name = a;
    var a = f.toString();
}
