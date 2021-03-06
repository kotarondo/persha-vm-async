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
    await test1(realm, '', 'for(;;);', [])
    await test1(realm, '', 'eval("for(;;);")', [])
    await test1(realm, '', 'for(var i=0;;i++);', [])
    await test1(realm, '', 'eval("for(var i=0;;i++);")', [])
    await test1(realm, '', 'for(var i=0;;);', [])
    await test1(realm, '', 'eval("for(var i=0;;);")', [])
    await test1(realm, '', 'while(true);', [])
    await test1(realm, '', 'eval("while(true);")', [])
    await test1(realm, '', 'with({})for(;;);', [])
    await test1(realm, '', 'eval("with({})for(;;);")', [])
    await test1(realm, '', 'try{for(;;);}finally{x=1;throw 1}', [])
    console.log('success')
}

async function test1(realm, para, text, args) {
    vm.context.stepsLimit = 10000000;
    var begin = Date.now();
    var { type, value } = await vm.evaluateFunction(realm, para, text, 'test.js', args)
    var elapsed = Date.now() - begin;
    assert(type === 'throw' && String(value) === 'RangeError: steps overflow');
    console.log('elapsed:' + elapsed, text);
}

test().catch(err => {
    console.log(err)
    process.exit(1);
})
