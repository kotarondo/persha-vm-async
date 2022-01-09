var a = new Array(0xffffffff);
while (true) {
    try {
        a.join();
    } catch (err) {
        if (err instanceof RangeError && err.message === 'too long result') continue;
        throw err;
    }
}
