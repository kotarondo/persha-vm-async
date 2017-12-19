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
    await test1(realm, '', 'function f(){return f()}; f();', [])
    console.log('success')
}

async function test1(realm, para, text, args) {
    var begin = Date.now();
    var { type, value } = await vm.evaluateFunction(realm, para, text, 'test.js', args)
    var elapsed = Date.now() - begin;
    assert(type === 'throw' && String(value) === 'RangeError: stack overflow');
    console.log('elapsed:' + elapsed, text);
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
