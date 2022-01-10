var a = ' ';
for (var i = 0; i < 100; i++) {
    var e = new Error(a);
    e.name = a;
    var a = e.toString();
}
throw a;
