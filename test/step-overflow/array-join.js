var a = new Array(0xffffffff);
while (true) {
    try {
        a.join();
    } catch (err) {
        if (err instanceof RangeError && err.message === 'Invalid string length') continue;
        throw err;
    }
}
