var a = '1,';
for (var i = 0; i < 18; i++) {
    a = a + a;
}
while (true) {
    eval('[' + a + ']');
}
