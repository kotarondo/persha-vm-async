// Copyright (c) 2017-2022, Kotaro Endo.
// All rights reserved.
// License: "BSD-3-Clause"

require('./harness')

var vm = new VM()

async function test() {
    var realm = await vm.createRealm()
    await test1(realm, '', 'function f(){return f()}; f();', [])
}

async function test1(realm, para, text, args) {
    var begin = Date.now()
    var { type, value } = await vm.evaluateFunction(realm, para, text, 'test.js', args)
    var elapsed = Date.now() - begin
    assert(type === 'throw' && String(value) === 'RangeError: stack overflow')
    console.log('elapsed:' + elapsed, text, value.stack)
}

test().then(test_success).catch(test_failed)
