var a = '1,';
for (var i = 0; i < 12; i++) {
    a = a + a;
}
while (true) {
    new Function('return [' + a + '];');
}
