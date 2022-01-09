var a = '\x12\xff';
for (var i = 0; i < 14; i++) {
    a = a + a;
}

while (true) escape(a);
