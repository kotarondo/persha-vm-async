var a = new Array(1000);
a[0] = 0;
a[1] = 0;
while (true) Array.prototype.splice.apply([], a);
