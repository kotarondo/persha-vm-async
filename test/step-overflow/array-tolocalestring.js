var a = new Array(0xffffffff);
while (true) {
    try {
        a.toLocaleString();
    } catch (err) {
        if (err instanceof RangeError && err.message === 'Invalid string length') continue;
        throw err;
    }
}
