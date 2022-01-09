function f(a) { return a }
for (var i = 0; i < 100; i++) {
    f = f.bind(null);
}

while (true) f.toString();
