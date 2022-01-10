var a = '%';
for (var i = 0; i < 19; i++) a = a + a;
while (true) {
    a = encodeURI(a);
}
