var a = new Array(10000);
a[0] = 0;
a[1] = 0;
while (true) Array.prototype.splice.apply([], a);
