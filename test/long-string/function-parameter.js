var a = 'a';
for (var i = 0; i < 10; i++) a = a + a;
var a = [a];
while (true) {
    a = a.concat(a);
    Function.apply(null, a);
}
