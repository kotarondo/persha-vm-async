// Copyright (c) 2017, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const VM = require('../index.js')
var vm = new VM()

async function test() {
    var realm = await vm.createRealm()
    var { type, value } = await vm.evaluateFunction(realm, 'a,b,c', 'return a+b+c', 'test.js', [1, 2, 'a4'])
    assert(type === 'normal' && value === '3a4');
    var { type, value } = await vm.evaluateFunction(realm, 'a123', 'return JSON.stringify(a123)', 'test.js', [{ a: 123, b: [1, 2, 3] }])
    assert(type === 'normal' && value === '{"a":123,"b":[1,2,3]}');
    var { type, value } = await vm.evaluateFunction(realm, 'a', 'return a.length;', 'test.js', [
        [1, 2, , , ]
    ])
    assert(type === 'normal' && value === 4);
    var { type, value } = await vm.evaluateFunction(realm, 'a123', 'throw a123', 'test.js', [{ a: 123, b: [1, 2, 3] }])
    assert(type === 'throw' && JSON.stringify(value) === '{"a":123,"b":[1,2,3]}');
    console.log('success')
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
