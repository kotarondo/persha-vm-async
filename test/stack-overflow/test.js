// expect: 'RangeError: stack overflow'

function f(){return f()};
f();
