var a = 'a';
while (a.length < 1e5) a = a + a;
var p = a;
while (true) {
    var f = new Function(p, a);
    var a = f.toString();
}
