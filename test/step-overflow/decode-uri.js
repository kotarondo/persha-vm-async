var a = '\x12\xff\u7654\ud834\udc12';
var b = encodeURI(a);
for (var i = 0; i < 13; i++) {
    b = b + b;
}

while (true) decodeURI(b);